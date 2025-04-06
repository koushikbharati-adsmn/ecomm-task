import { Request } from 'express'
import { User } from './common'

export interface AuthenticatedRequest<
  Params = Record<string, unknown>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = qs.ParsedQs,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user?: {
    id?: string
  }
}

export interface SignupParams {
  email: string
  password: string
  name: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface FetchProductsParams {
  search?: string
  page?: number
  limit?: number
}

export interface FetchOrdersParams {
  search?: string
  page?: number
  limit?: number
}

export interface FetchUsersParams {
  search?: string
  page?: number
  limit?: number
}

export interface CreateOrderParams {
  product_id: string
  quantity: number
}

export interface AddProductParams {
  name: string
  category: string
  price: number
}

export interface UpdateUserParams {
  name: string
  email: string
  role: string
}
