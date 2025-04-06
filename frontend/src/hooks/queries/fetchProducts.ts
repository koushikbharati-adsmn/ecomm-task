import { useInfiniteQuery } from '@tanstack/react-query'
import { FetchProductsParams } from '@/types/requests'
import { ApiResponse, Product } from '@/types/responses'
import apiClient from '@/utils/apiClient'

type FetchProductsResult = ApiResponse<{
  data: Product[]
  totalPages: number
  totalItems: number
  currentPage: number
}>

const fetchProducts = async ({
  pageParam = 1,
  query
}: {
  pageParam?: number
  query: FetchProductsParams
}): Promise<FetchProductsResult> => {
  const res = await apiClient.get('/products', {
    params: {
      search: query.search,
      limit: query.limit,
      page: pageParam
    }
  })

  return res.data
}

export const useInfiniteFetchProducts = (query: FetchProductsParams) => {
  return useInfiniteQuery({
    queryKey: ['products', query],
    queryFn: ({ pageParam }) => fetchProducts({ pageParam, query }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.currentPage || 1
      const totalPages = lastPage.data?.totalPages || 1
      return currentPage < totalPages ? currentPage + 1 : undefined
    }
  })
}
