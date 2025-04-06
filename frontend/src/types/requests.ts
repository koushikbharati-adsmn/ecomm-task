export interface SignupParams {
  email: string
  password: string
  name: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface CreateOrderParams {
  product_id: string
  quantity: number
}

export interface FetchProductsParams {
  search?: string
  limit?: number
}

export interface AddProductParams {
  name: string
  category: string
  price: number
}

export interface FetchOrdersParams {
  search?: string
  limit?: number
}

export interface FetchUsersParams {
  search?: string
  limit?: number
}

export interface UpdateUserParams {
  userId: string
  name: string
  email: string
  role: string
}
