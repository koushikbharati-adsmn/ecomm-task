import { ApiResponse, Product } from '@/types/responses'
import apiClient from '@/utils/apiClient'
import { useQuery } from '@tanstack/react-query'

const fetchRecommendedProducts = async (): Promise<ApiResponse<Product[]>> => {
  const response = await apiClient.get('/products/recommendations')
  return response.data
}

export const useFetchRecommendedProducts = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendedProducts
  })
}
