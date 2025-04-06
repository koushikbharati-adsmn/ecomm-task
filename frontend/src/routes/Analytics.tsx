import Container from '@/components/layout/Container'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useUserStore } from '@/store/useUserStore'
import { socket } from '@/utils/socket'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

export default function AnalyticsPage() {
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [totalOrders, setTotalOrders] = useState<number>(0)

  const user = useUserStore((state) => state.user)

  useEffect(() => {
    function onActiveUsers(data: number) {
      setActiveUsers(data)
    }

    function onTotalOrders(data: number) {
      setTotalOrders(data)
    }

    socket.emit('getAnalytics')

    socket.on('activeUsers', onActiveUsers)
    socket.on('totalOrders', onTotalOrders)

    return () => {
      socket.off('activeUsers', onActiveUsers)
      socket.off('totalOrders', onTotalOrders)
    }
  }, [])

  if (user?.role !== 'admin') return <Navigate to='/' />

  return (
    <Container>
      <header className='sticky top-0 flex h-16 items-center justify-between border-b border-gray-400 bg-white px-6'>
        <h3 className='text-2xl font-bold'>Analytics</h3>
      </header>
      <section className='grid grid-cols-3 gap-4 p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>
              Number of active users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>
              Number of total orders on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{totalOrders}</p>
          </CardContent>
        </Card>
      </section>
    </Container>
  )
}
