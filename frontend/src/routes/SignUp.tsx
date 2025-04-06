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
import { signupFormSchema } from '@/lib/validations'
import { Link, Navigate } from 'react-router-dom'
import { useSignupMutation } from '@/hooks/mutations/useSignupMutation'
import { Button } from '@/components/ui/button'
import { LucideLoader } from 'lucide-react'

export default function SignUp() {
  const token = localStorage.getItem('token')

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
  })

  const { mutateAsync, isPending } = useSignupMutation()

  function onSubmit(values: z.infer<typeof signupFormSchema>) {
    mutateAsync({
      name: values.name,
      email: values.email,
      password: values.password
    })
  }

  const onGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  if (token) return <Navigate to='/' />

  return (
    <div className='flex h-dvh items-center justify-center overflow-y-auto'>
      <Form {...form}>
        <form
          id='login-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 drop-shadow-lg'
        >
          <h2 className='text-center text-2xl font-bold'>Signup</h2>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='Enter your full name'
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
            Sign up with Google
          </Button>

          <div className='text-center text-sm'>
            Already have an account?&nbsp;
            <Link className='font-semibold' to='/login'>
              Login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
