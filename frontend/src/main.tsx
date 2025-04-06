import { lazy, StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'

import { Toaster } from './components/ui/sonner'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import RootLayout from './components/layout/RootLayout'
import PageLoading from './components/layout/PageLoading'

const Home = lazy(() => import('./routes/Home'))
const OrdersPage = lazy(() => import('./routes/Orders'))
const UsersPage = lazy(() => import('./routes/Users'))
const AnalyticsPage = lazy(() => import('./routes/Analytics'))
const LoginPage = lazy(() => import('./routes/Login'))
const SignUpPage = lazy(() => import('./routes/SignUp'))

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/orders',
        element: <OrdersPage />
      },
      {
        path: '/users',
        element: <UsersPage />
      },
      {
        path: '/analytics',
        element: <AnalyticsPage />
      }
    ]
  },
  {
    path: 'login',
    element: <LoginPage />
  },
  {
    path: 'signup',
    element: <SignUpPage />
  }
])

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<PageLoading />}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster />
      </QueryClientProvider>
    </StrictMode>
  )
}
