import { Router } from 'express'
import { Order } from '../models/Order'
import { createResponse } from '../utils/createResponse'
import {
  AuthenticatedRequest,
  CreateOrderParams,
  FetchOrdersParams,
} from '../types/requests'
import mongoose from 'mongoose'
import { Product } from '../models/Product'
import { io } from '../socket'
import User from '../models/User'

const router = Router()

router.get(
  '/',
  async (req: AuthenticatedRequest<{}, {}, FetchOrdersParams>, res) => {
    try {
      const user_id = new mongoose.Types.ObjectId(req.user!.id)

      const user = await User.findById(user_id).select('role')

      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const skip = (page - 1) * limit
      const search = req.query.search || ''

      const matchStage = user?.role === 'admin' ? {} : { user_id }

      const aggregationPipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
      ]

      if (search) {
        aggregationPipeline.push({
          $match: {
            'product.name': { $regex: search, $options: 'i' },
          },
        })
      }

      // Count total after filtering
      const totalPipeline = [...aggregationPipeline, { $count: 'total' }]
      const totalResult = await Order.aggregate(totalPipeline)
      const total = totalResult[0]?.total || 0

      aggregationPipeline.push(
        { $sort: { order_date: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            quantity: 1,
            order_date: 1,
            user_id: 1,
            product_id: '$product._id',
            product: {
              name: '$product.name',
              price: '$product.price',
              category: '$product.category',
            },
          },
        },
      )

      const orders = await Order.aggregate(aggregationPipeline)

      res.status(200).json(
        createResponse(true, 'Orders fetched successfully', {
          data: orders,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        }),
      )
    } catch (error) {
      console.error('Error fetching user orders:', error)
      res.status(500).json(createResponse(false, 'Something went wrong'))
    }
  },
)

router.post(
  '/',
  async (req: AuthenticatedRequest<{}, {}, CreateOrderParams, {}>, res) => {
    try {
      const { product_id, quantity } = req.body
      const user_id = req.user?.id

      if (!product_id || !quantity) {
        res.status(400).json(createResponse(false, 'Missing required fields'))
        return
      }

      const product = await Product.findById(product_id)
      if (!product) {
        res.status(404).json(createResponse(false, 'Product not found'))
        return
      }

      const newOrder = new Order({
        user_id,
        product_id,
        quantity,
      })

      const savedOrder = await newOrder.save()

      await Product.findByIdAndUpdate(product_id, {
        $inc: { sales_count: quantity },
      })

      const totalOrders = await Order.countDocuments()
      io.emit('totalOrders', totalOrders)

      res
        .status(201)
        .json(createResponse(true, 'Order created successfully', savedOrder))
    } catch (error) {
      console.error('Error creating order:', error)
      res.status(500).json(createResponse(false, 'Something went wrong'))
    }
  },
)

export default router
