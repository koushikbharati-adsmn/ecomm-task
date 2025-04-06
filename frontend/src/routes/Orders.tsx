import Container from '@/components/layout/Container'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/common/useDebounce'
import { useIntersectionObserver } from '@/hooks/common/useIntersectionObserver'
import { useInfiniteFetchOrders } from '@/hooks/queries/fetchOrders'
import { useUserStore } from '@/store/useUserStore'
import { format } from 'date-fns-tz'
import { LucideLoader } from 'lucide-react'
import React from 'react'

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = React.useState('')

  const debouncedSearch = useDebounce(searchTerm, 1000)

  const user = useUserStore((state) => state.user)

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useInfiniteFetchOrders({
      search: debouncedSearch,
      limit: 10
    })

  const triggerRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage && !isLoading,
    rootMargin: '50px'
  })

  if (isLoading) {
    return (
      <Container>
        <div className='flex h-full items-center justify-center'>
          <LucideLoader className='animate-spin' />
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-400 bg-white px-6'>
        <h3 className='text-2xl font-bold'>Orders</h3>

        <div>
          <Input
            className='bg-white'
            placeholder='Search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      <section className='p-6'>
        <h3 className='mb-4 text-sm font-semibold'>
          {user?.role === 'admin' ? 'All' : 'Your'} Orders
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead className='text-right'>Price</TableHead>
              <TableHead className='text-right'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page?.data?.data.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className='font-medium'>{order._id}</TableCell>
                    <TableCell>{order.product.name}</TableCell>
                    <TableCell>{order.product.category}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      {format(new Date(order.order_date), 'dd/MM/yyyy hh:mm a')}
                    </TableCell>
                    <TableCell className='text-right'>
                      {order.product.price}
                    </TableCell>
                    <TableCell className='text-right'>
                      {order.quantity * order.product.price}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        <div ref={triggerRef} className='mt-6 flex items-center justify-center'>
          {isFetchingNextPage ? (
            <LucideLoader className='mr-2 animate-spin' />
          ) : hasNextPage ? (
            'Scroll to load more'
          ) : (
            'No more data available'
          )}
        </div>
      </section>
    </Container>
  )
}
