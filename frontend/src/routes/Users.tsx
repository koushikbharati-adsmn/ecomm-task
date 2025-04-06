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
import { useUpdateUser } from '@/hooks/mutations/useUpdateUser'
import { useInfiniteFetchUsers } from '@/hooks/queries/fetchUsers'
import { userFormSchema } from '@/lib/validations'
import { useUserStore } from '@/store/useUserStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns-tz'
import { LucideLoader } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openUserModal, setOpenUserModal] = useState(false)
  const [userId, setUserId] = useState('')

  const debouncedSearch = useDebounce(searchTerm, 1000)

  const {
    data: users,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteFetchUsers({
    search: debouncedSearch,
    limit: 10
  })

  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser()

  const triggerRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage,
    rootMargin: '0px'
  })

  const user = useUserStore((state) => state.user)

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user'
    }
  })

  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    await updateUser(
      {
        userId,
        name: data.name,
        email: data.email,
        role: data.role
      },
      {
        onSettled: () => {
          form.reset()
          setUserId('')
          setOpenUserModal(false)
        }
      }
    )
  }

  if (user?.role !== 'admin') return <Navigate to='/' />

  return (
    <Container>
      <header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-400 bg-white px-6'>
        <h3 className='text-2xl font-bold'>Users</h3>

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
        <h3 className='mb-4 text-sm font-semibold'>All Users</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead>Failed Attempts</TableHead>
              <TableHead>Locked Until</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page?.data?.data.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className='font-medium'>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className='capitalize'>{user.role}</TableCell>
                    <TableCell>
                      {format(new Date(user.signup_date), 'dd/MM/yyyy hh:mm a')}
                    </TableCell>
                    <TableCell>{user.failedAttempts}</TableCell>
                    <TableCell>
                      {user.lockedUntil
                        ? format(
                            new Date(user.lockedUntil),
                            'dd/MM/yyyy hh:mm a'
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={openUserModal}
                        onOpenChange={setOpenUserModal}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              setUserId(user._id),
                                form.reset({
                                  name: user.name,
                                  email: user.email,
                                  role: user.role
                                })
                            }}
                          >
                            <HiOutlinePencilSquare />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update User</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form
                              id='user-form'
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
                                        placeholder='Enter name'
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input
                                        type='text'
                                        placeholder='Enter email'
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className='w-full'>
                                          <SelectValue placeholder='Select a role' />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value='user'>
                                          User
                                        </SelectItem>
                                        <SelectItem value='admin'>
                                          Admin
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </form>
                          </Form>
                          <DialogFooter>
                            <Button
                              form='user-form'
                              type='submit'
                              disabled={isUpdating}
                            >
                              Update
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
