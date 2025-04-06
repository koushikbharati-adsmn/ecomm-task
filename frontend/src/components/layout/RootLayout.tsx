import {
  HiOutlineArrowLeftEndOnRectangle,
  HiOutlineChartBar,
  HiOutlineShoppingBag,
  HiOutlineSquares2X2,
  HiOutlineUserGroup
} from 'react-icons/hi2'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../ui/button'
import { PropsWithChildren, useEffect } from 'react'
import { socket } from '@/utils/socket'
import { useFetchUserProfile } from '@/hooks/queries/fetchProfile'
import { useUserStore } from '@/store/useUserStore'

export default function RootLayout() {
  useEffect(() => {
    socket.auth = { token: localStorage.getItem('token') }
    socket.connect()
  }, [])

  const { data: user, isLoading } = useFetchUserProfile()

  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    if (isLoading) return

    if (user && user.data) {
      setUser(user.data)
      localStorage.setItem('user', JSON.stringify(user.data))
    }
  }, [user, isLoading])

  const handleLogout = () => {
    socket.disconnect()
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return (
    <div className='flex h-dvh'>
      <aside className='flex max-w-56 flex-1 flex-col border-r border-gray-400'>
        <h2 className='flex h-16 items-center justify-center border-b border-gray-400 text-center text-2xl font-bold'>
          Brand Logo
        </h2>
        <nav className='w-full flex-1 space-y-2 p-4'>
          <SidebarLink to='/'>
            <HiOutlineSquares2X2 className='size-5' />
            Products
          </SidebarLink>
          <SidebarLink to='/orders'>
            <HiOutlineShoppingBag className='size-5' />
            Orders
          </SidebarLink>
          {user?.data?.role === 'admin' && (
            <SidebarLink to='/users'>
              <HiOutlineUserGroup className='size-5' />
              Users
            </SidebarLink>
          )}
          {user?.data?.role === 'admin' && (
            <SidebarLink to='/analytics'>
              <HiOutlineChartBar className='size-5' />
              Analytics
            </SidebarLink>
          )}
        </nav>
        <div className='p-4'>
          <Button
            className='w-full justify-start gap-4 text-red-600 hover:text-red-600'
            variant='ghost'
            onClick={handleLogout}
          >
            <HiOutlineArrowLeftEndOnRectangle className='size-5' />
            Logout
          </Button>
        </div>
      </aside>
      <Outlet />
    </div>
  )
}

function SidebarLink({ to, children }: PropsWithChildren<{ to: string }>) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 rounded-md px-4 py-2 text-sm hover:cursor-pointer ${
          isActive ? 'bg-gray-950 text-gray-200' : 'text-gray-600'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
