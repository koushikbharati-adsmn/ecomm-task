export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export interface AuthResponse {
  token: string
}

export interface Order {
  _id: string
  user_id: string
  quantity: number
  order_date: Date
  product: {
    name: string
    price: number
    category: string
  }
  product_id: string
}

export interface Product {
  category: string
  name: string
  price: number
  sales_count: number
  _id: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  signup_date: Date
  failedAttempts: number
  lockedUntil: Date | null
  __v: number
}
