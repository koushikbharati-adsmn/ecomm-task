import { UpdateUserParams } from '@/types/requests'
import { ApiResponse } from '@/types/responses'
import apiClient from '@/utils/apiClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

export const updateUser = async ({
  name,
  email,
  role,
  userId
}: UpdateUserParams) => {
  const response = await apiClient.patch(`/users/${userId}`, {
    name,
    email,
    role
  })

  return response.data
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users']
      })
      queryClient.invalidateQueries({
        queryKey: ['profile']
      })
    },
    onError: (error: AxiosError<ApiResponse>) => {
      console.error(error)
      const message =
        error.response?.data?.message || error.message || 'Something went wrong'
      toast.error(message)
    }
  })
}
