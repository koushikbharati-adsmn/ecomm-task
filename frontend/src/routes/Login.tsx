import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginFormSchema } from '@/lib/validations'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '@/hooks/mutations/useLoginMutation'
import { LucideLoader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { socket } from '@/utils/socket'

export default function LoginPage() {
  const token = localStorage.getItem('token')

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const { mutateAsync, isPending } = useLoginMutation()
  const { search } = useLocation()
  const navigate = useNavigate()

  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    mutateAsync({
      email: values.email,
      password: values.password
    })
  }

  const onGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  useEffect(() => {
    const params = new URLSearchParams(search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)
      socket.auth = { token }
      navigate('/')
    }
  }, [navigate])

  if (token) return <Navigate to='/' />

  return (
    <div className='flex h-dvh items-center justify-center overflow-y-auto'>
      <Form {...form}>
        <form
          id='login-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 drop-shadow-lg'
        >
          <h2 className='text-center text-2xl font-bold'>Login</h2>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='Enter your email'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className='w-full' variant='default' disabled={isPending}>
            {isPending ? (
              <LucideLoader className='size-5 animate-spin' />
            ) : (
              'Submit'
            )}
          </Button>

          <div className='relative flex items-center font-bold before:mr-4 before:flex-1 before:border-b before:border-neutral-200 after:ml-4 after:flex-1 after:border-b after:border-neutral-200'>
            OR
          </div>

          <Button
            className='w-full'
            variant='outline'
            type='button'
            onClick={onGoogleSignIn}
          >
            <img src='google.svg' alt='google' />
            Sign in with Google
          </Button>

          <div className='text-center text-sm'>
            Don't have an account?&nbsp;
            <Link className='font-semibold' to='/signup'>
              Signup
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
