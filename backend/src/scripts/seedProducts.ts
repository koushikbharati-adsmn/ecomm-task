import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import { Product } from '../models/Product'
import envConfig from '../configs/env'

// Optional: set a seed for reproducible results
// faker.seed(123);

const generateRandomProducts = (count: number) => {
  const products = []

  for (let i = 0; i < count; i++) {
    products.push({
      name: faker.commerce.productName(), // Realistic product name
      category: faker.commerce.department(), // Random category
      price: parseFloat(faker.commerce.price()), // Random price as number
      sales_count: faker.number.int({ min: 0, max: 1000 }), // Random sales count
    })
  }

  return products
}

const seedProducts = async () => {
  try {
    await mongoose.connect(envConfig.mongoURI)
    console.log('✅ MongoDB connected')

    const products = generateRandomProducts(100)
    await Product.insertMany(products)

    console.log('✅ Successfully seeded 100 random products')
    await mongoose.disconnect()
  } catch (err) {
    console.error('❌ Error inserting products:', err)
  }
}

seedProducts()
