import { AddProductParams } from '@/types/requests'
import apiClient from '@/utils/apiClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { ApiResponse } from '@/types/responses'

const addProduct = async ({ name, price, category }: AddProductParams) => {
  const response = await apiClient.post('/products', {
    name,
    price,
    category
  })

  return response.data
}

export const useAddProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products']
      })
      toast.success('Product Added successfully!')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      console.error(error)
      const message =
        error.response?.data?.message || error.message || 'Something went wrong'
      toast.error(message)
    }
  })
}
