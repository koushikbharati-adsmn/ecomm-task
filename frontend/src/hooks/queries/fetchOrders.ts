import { useInfiniteQuery } from '@tanstack/react-query'
import { FetchOrdersParams } from '@/types/requests'
import { ApiResponse, Order } from '@/types/responses'
import apiClient from '@/utils/apiClient'

type FetchOrdersResult = ApiResponse<{
  data: Order[]
  totalPages: number
  totalItems: number
  currentPage: number
}>

const fetchOrders = async ({
  pageParam = 1,
  query
}: {
  pageParam?: number
  query: FetchOrdersParams
}): Promise<FetchOrdersResult> => {
  const res = await apiClient.get('/orders', {
    params: {
      search: query.search,
      limit: query.limit,
      page: pageParam
    }
  })

  return res.data
}

export const useInfiniteFetchOrders = (query: FetchOrdersParams) => {
  return useInfiniteQuery({
    queryKey: ['orders', query],
    queryFn: ({ pageParam }) => fetchOrders({ pageParam, query }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.currentPage || 1
      const totalPages = lastPage.data?.totalPages || 1
      return currentPage < totalPages ? currentPage + 1 : undefined
    }
  })
}
