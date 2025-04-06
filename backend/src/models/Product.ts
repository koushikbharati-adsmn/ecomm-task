import { Schema, model } from 'mongoose'

export interface IProduct {
  _id: string
  name: string
  category: string
  price: number
  sales_count: number
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  sales_count: { type: Number, default: 0 },
})

export const Product = model<IProduct>('Product', ProductSchema)
