import { SignupParams } from '@/types/requests'
import { ApiResponse, AuthResponse } from '@/types/responses'
import apiClient from '@/utils/apiClient'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { socket } from '@/utils/socket'

const signup = async (
  data: SignupParams
): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post('/auth/signup', data)
  return response.data
}

export const useSignupMutation = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (data.data) {
        localStorage.setItem('token', data.data.token)
        socket.auth = { token: data.data.token }
        navigate('/')
      }
    },
    onError: (error: AxiosError<ApiResponse<AuthResponse>>) => {
      console.error(error)
      const message =
        error.response?.data?.message || error.message || 'Something went wrong'
      toast.error(message)
    }
  })
}
