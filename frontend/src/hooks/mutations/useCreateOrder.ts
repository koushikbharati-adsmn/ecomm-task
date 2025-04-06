import { CreateOrderParams } from '@/types/requests'
import apiClient from '@/utils/apiClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { ApiResponse } from '@/types/responses'

const createOrder = async ({ quantity, product_id }: CreateOrderParams) => {
  const response = await apiClient.post('/orders', {
    quantity,
    product_id
  })

  return response.data
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recommendations']
      })
      toast.success(
        'Product purchased successfully! You can view your orders on the orders page.'
      )
    },
    onError: (error: AxiosError<ApiResponse>) => {
      console.error(error)
      const message =
        error.response?.data?.message || error.message || 'Something went wrong'
      toast.error(message)
    }
  })
}
