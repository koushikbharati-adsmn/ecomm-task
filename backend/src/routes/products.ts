import { Response, Router } from 'express'
import { Product } from '../models/Product'
import { createResponse } from '../utils/createResponse'
import {
  AddProductParams,
  AuthenticatedRequest,
  FetchProductsParams,
} from '../types/requests'
import { Order } from '../models/Order'
import mongoose from 'mongoose'

const router = Router()

router.get(
  '/',
  async (
    req: AuthenticatedRequest<{}, {}, {}, FetchProductsParams>,
    res: Response,
  ) => {
    try {
      const search = req.query.search
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10

      const query = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { category: { $regex: search, $options: 'i' } },
            ],
          }
        : {}

      const skip = (page - 1) * limit

      const [products, total] = await Promise.all([
        Product.find(query).skip(skip).limit(limit),
        Product.countDocuments(query),
      ])

      res.status(200).json(
        createResponse(true, 'Products fetched successfully', {
          data: products,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        }),
      )
    } catch (error) {
      console.error('Error fetching products:', error)
      res.status(500).json(createResponse(false, 'Error fetching products'))
    }
  },
)

router.post(
  '/',
  async (req: AuthenticatedRequest<{}, {}, AddProductParams>, res) => {
    try {
      const { name, category, price } = req.body

      // Basic validation
      if (!name || !category || typeof price !== 'number') {
        res.status(400).json(createResponse(false, 'Missing required fields'))
        return
      }

      const newProduct = new Product({
        name,
        category,
        price,
      })

      await newProduct.save()
      res.status(201).json(createResponse(true, 'Product added successfully'))
    } catch (error) {
      console.error('Error adding product:', error)
      res.status(500).json(createResponse(false, 'Error adding product'))
    }
  },
)

router.get('/recommendations', async (req: AuthenticatedRequest, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user!.id)

    // Step 1: Get user's purchased product IDs and category counts via aggregation
    const userCategoryAgg = await Order.aggregate([
      { $match: { user_id: userObjectId } },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: {
            category: '$product.category',
            product_id: '$product._id',
          },
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          totalQuantity: { $sum: '$quantity' },
          purchasedProducts: { $addToSet: '$_id.product_id' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
    ])

    // If user has no orders — fallback to global best sellers
    if (userCategoryAgg.length === 0) {
      const topProducts = await Product.find()
        .sort({ sales_count: -1 })
        .limit(5)
      res
        .status(200)
        .json(
          createResponse(
            true,
            'Recommendations generated successfully',
            topProducts,
          ),
        )
      return
    }

    // Extract top categories and purchased product IDs
    const topCategories = userCategoryAgg.map((item) => item._id)
    const purchasedProductIds = userCategoryAgg.flatMap(
      (item) => item.purchasedProducts,
    )
    const purchasedProductSet = new Set(
      purchasedProductIds.map((id) => id.toString()),
    )

    // Step 2: Use aggregation with $facet to fetch trending & collaborative in one go
    const recentThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days

    const [result] = await Product.aggregate([
      {
        $facet: {
          trending: [
            {
              $match: {
                category: { $in: topCategories },
                _id: { $nin: purchasedProductIds },
              },
            },
            {
              $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'product_id',
                as: 'recentOrders',
              },
            },
            {
              $addFields: {
                recentSales: {
                  $size: {
                    $filter: {
                      input: '$recentOrders',
                      as: 'order',
                      cond: { $gte: ['$$order.order_date', recentThreshold] },
                    },
                  },
                },
              },
            },
            { $sort: { recentSales: -1, sales_count: -1 } },
            { $limit: 5 },
          ],
          collaborative: [
            {
              $match: {
                _id: { $in: purchasedProductIds },
              },
            },
            {
              $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'product_id',
                as: 'orders',
              },
            },
            { $unwind: '$orders' },
            {
              $match: {
                'orders.user_id': { $ne: userObjectId },
              },
            },
            {
              $group: {
                _id: '$orders.product_id',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
              },
            },
            { $unwind: '$product' },
            {
              $replaceRoot: { newRoot: '$product' },
            },
            {
              $match: {
                _id: { $nin: purchasedProductIds },
              },
            },
            { $limit: 5 },
          ],
        },
      },
    ])

    // Step 3: Merge, dedupe, and return top 5
    const combined = [
      ...(result.trending || []),
      ...(result.collaborative || []),
    ]
    const seen = new Set()
    const recommended = []

    for (const product of combined) {
      const id = product._id.toString()
      if (!seen.has(id) && !purchasedProductSet.has(id)) {
        seen.add(id)
        recommended.push(product)
      }
      if (recommended.length === 5) break
    }

    // Step 4: Fill with global best sellers if less than 5
    if (recommended.length < 5) {
      const remaining = 5 - recommended.length

      // Create a Set of all IDs to exclude
      const excludeIds = new Set([
        ...Array.from(seen),
        ...purchasedProductIds.map((id) => id.toString()),
      ])

      // Fetch extra products (over-fetch a bit to be safe)
      const fallback = await Product.find().sort({ sales_count: -1 }).limit(20) // get more than needed in case some are excluded below

      for (const product of fallback) {
        const id = product._id.toString()
        if (!excludeIds.has(id)) {
          recommended.push(product)
          excludeIds.add(id)
        }
        if (recommended.length === 5) break
      }
    }

    res
      .status(200)
      .json(
        createResponse(
          true,
          'Recommendations generated successfully',
          recommended,
        ),
      )
  } catch (error) {
    console.error('Error generating recommendations:', error)
    res
      .status(500)
      .json(createResponse(false, 'Error generating recommendations'))
  }
})

export default router
