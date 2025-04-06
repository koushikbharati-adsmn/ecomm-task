import mongoose, { Schema, model } from 'mongoose'

const OrderSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  order_date: { type: Date, default: Date.now },
})

export const Order = model('Order', OrderSchema)
