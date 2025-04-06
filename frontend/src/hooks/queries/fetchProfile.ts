import { ApiResponse, User } from '@/types/responses'
import apiClient from '@/utils/apiClient'
import { useQuery } from '@tanstack/react-query'

const fetchUserProfile = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get('/users/me')
  return response.data
}

export const useFetchUserProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile
  })
}
