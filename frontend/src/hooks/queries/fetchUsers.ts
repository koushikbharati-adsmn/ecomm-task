import { FetchUsersParams } from '@/types/requests'
import { ApiResponse, User } from '@/types/responses'
import apiClient from '@/utils/apiClient'
import { useInfiniteQuery } from '@tanstack/react-query'

type FetchUsersResult = ApiResponse<{
  data: User[]
  totalPages: number
  totalItems: number
  currentPage: number
}>

const fetchUsers = async ({
  pageParam,
  query
}: {
  pageParam?: number
  query: FetchUsersParams
}): Promise<FetchUsersResult> => {
  const response = await apiClient.get('/users', {
    params: {
      search: query.search,
      limit: query.limit,
      page: pageParam
    }
  })
  return response.data
}

export const useInfiniteFetchUsers = (query: FetchUsersParams) => {
  return useInfiniteQuery({
    queryKey: ['users', query],
    queryFn: ({ pageParam }) => fetchUsers({ pageParam, query }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.currentPage || 1
      const totalPages = lastPage.data?.totalPages || 1
      return currentPage < totalPages ? currentPage + 1 : undefined
    }
  })
}
