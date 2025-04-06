import Container from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/common/useDebounce'
import { useIntersectionObserver } from '@/hooks/common/useIntersectionObserver'
import { useAddProduct } from '@/hooks/mutations/useAddProduct'
import { useCreateOrder } from '@/hooks/mutations/useCreateOrder'
import { useInfiniteFetchProducts } from '@/hooks/queries/fetchProducts'
import { useFetchRecommendedProducts } from '@/hooks/queries/fetchRecommendations'
import { addProductSchema } from '@/lib/validations'
import { useUserStore } from '@/store/useUserStore'
import { Product } from '@/types/responses'
import { zodResolver } from '@hookform/resolvers/zod'
import { LucideLoader } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { HiMiniMinus, HiMiniPlus } from 'react-icons/hi2'
import { z } from 'zod'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openProductModal, setOpenProductModal] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 1000)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFetchingProducts
  } = useInfiniteFetchProducts({
    search: debouncedSearch,
    limit: 10
  })

  const { data: recommendedProducts, isLoading: isFetchingRecommended } =
    useFetchRecommendedProducts()

  const triggerRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled:
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchingProducts &&
      !isFetchingRecommended,
    rootMargin: '0px'
  })

  const user = useUserStore((state) => state.user)

  const form = useForm<z.infer<typeof addProductSchema>>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0
    }
  })

  const { mutateAsync: addProduct, isPending: isAdding } = useAddProduct()

  const onSubmit = async (data: z.infer<typeof addProductSchema>) => {
    addProduct(
      { name: data.name, category: data.category, price: data.price },
      {
        onSettled: () => {
          setOpenProductModal(false)
        }
      }
    )
  }

  if (isFetchingProducts || isFetchingRecommended) {
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
        <h3 className='text-2xl font-bold'>Products</h3>
        <div className='flex items-center gap-4'>
          <Input
            className='bg-white'
            placeholder='Search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {user?.role === 'admin' && (
            <Dialog open={openProductModal} onOpenChange={setOpenProductModal}>
              <DialogTrigger asChild>
                <Button>
                  <HiMiniPlus className='size-5' />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Product</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    id='addProduct-form'
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              type='text'
                              placeholder='Enter product name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='category'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a category' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='Electronics'>
                                Electronics
                              </SelectItem>
                              <SelectItem value='Clothing'>Clothing</SelectItem>
                              <SelectItem value='Grocery'>Grocery</SelectItem>
                              <SelectItem value='Furniture'>
                                Furniture
                              </SelectItem>
                              <SelectItem value='Fitness'>Fitness</SelectItem>
                              <SelectItem value='Books'>Books</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type='text'
                              placeholder='Enter product price'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <DialogFooter>
                  <Button
                    form='addProduct-form'
                    type='submit'
                    disabled={isAdding}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>
      {!searchTerm && (
        <section className='border-b border-gray-400 p-6'>
          <h3 className='mb-4 text-sm font-semibold'>Recommended Products</h3>
          <div className='grid grid-cols-5 gap-4'>
            {recommendedProducts?.data?.map((product) => (
              <ProductCard key={product._id} data={product} />
            ))}
          </div>
        </section>
      )}
      <section className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-sm font-semibold'>All Products</h3>
        </div>
        <div className='grid grid-cols-5 gap-4'>
          {data?.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page?.data?.data.map((product) => (
                <ProductCard key={product._id} data={product} />
              ))}
            </React.Fragment>
          ))}
        </div>
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

function ProductCard({ data }: { data: Product }) {
  const [quantity, setQuantity] = useState(1)
  const incrementQuantity = () => {
    if (quantity >= 50) return
    setQuantity(quantity + 1)
  }
  const decrementQuantity = () => {
    if (quantity <= 1) return
    setQuantity(quantity - 1)
  }

  const user = useUserStore((state) => state.user)

  const { mutateAsync: createOrder, isPending } = useCreateOrder()

  return (
    <figure className='space-y-4 rounded-md border bg-white p-4'>
      <div className='aspect-video rounded-sm bg-gray-300'></div>
      <figcaption>
        <h3 className='line-clamp-1 max-w-40 text-sm font-semibold'>
          {data.name}
        </h3>
        <h4 className='text-sm font-medium text-gray-500'>{data.category}</h4>
        <p className='text-sm'>Rs. {data.price}</p>
      </figcaption>
      {user?.role !== 'admin' && (
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' onClick={decrementQuantity}>
            <HiMiniMinus />
          </Button>
          <Input
            className='text-center'
            type='text'
            value={quantity}
            readOnly
          />
          <Button variant='outline' size='icon' onClick={incrementQuantity}>
            <HiMiniPlus />
          </Button>
        </div>
      )}

      {user?.role !== 'admin' && (
        <Button
          className='w-full'
          onClick={() => createOrder({ product_id: data._id, quantity })}
          disabled={isPending}
        >
          Buy
        </Button>
      )}
    </figure>
  )
}

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { useRef, useState } from 'react'
// import { HiMiniMinus, HiMiniPlus } from 'react-icons/hi2'
// import { useVirtualizer } from '@tanstack/react-virtual'

// export default function Home() {
//   const parentRef = useRef<HTMLDivElement | null>(null)

//   const rowVirtualizer = useVirtualizer({
//     count: 10000,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 120, // adjust height estimate
//     overscan: 10
//   })

//   return (
//     <div className='h-full w-full flex-1 overflow-y-auto' ref={parentRef}>
//       <header className='sticky top-0 z-10 flex h-16 items-center justify-start border-b bg-white px-6 text-3xl font-bold'>
//         Home
//       </header>
//       <section className='p-6'>
//         <div
//           className='relative'
//           style={{
//             height: `${rowVirtualizer.getTotalSize()}px`,
//             position: 'relative'
//           }}
//         >
//           {rowVirtualizer.getVirtualItems().map((virtualRow) => (
//             <div
//               key={virtualRow.key}
//               data-index={virtualRow.index}
//               ref={rowVirtualizer.measureElement}
//               className='absolute top-0 left-0 w-full'
//               style={{
//                 transform: `translateY(${virtualRow.start}px)`
//               }}
//             >
//               <ProductCard index={virtualRow.index} />
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   )
// }

// function ProductCard({ index }: { index: number }) {
//   const [quantity, setQuantity] = useState(1)
//   const incrementQuantity = () => {
//     setQuantity(quantity + 1)
//   }
//   const decrementQuantity = () => {
//     if (quantity <= 1) return
//     setQuantity(quantity - 1)
//   }

//   return (
//     <figure className='mb-4 grid h-32 grid-cols-4 gap-4 rounded-md border p-4'>
//       <div className='h-full rounded-sm bg-gray-300'></div>
//       <figcaption className='col-span-2'>
//         <h3 className='text-sm font-semibold'>Product Name #{index + 1}</h3>
//         <p className='text-sm'>Rs. 2000</p>
//       </figcaption>
//       <div>
//         <div className='mb-4 flex items-center gap-2'>
//           <Button variant='outline' size='icon' onClick={decrementQuantity}>
//             <HiMiniMinus />
//           </Button>
//           <Input
//             className='text-center'
//             type='text'
//             value={quantity}
//             readOnly
//           />
//           <Button variant='outline' size='icon' onClick={incrementQuantity}>
//             <HiMiniPlus />
//           </Button>
//         </div>
//         <Button className='w-full'>Buy</Button>
//       </div>
//     </figure>
//   )
// }
