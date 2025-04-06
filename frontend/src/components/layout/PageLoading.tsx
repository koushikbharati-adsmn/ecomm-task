import { LucideLoader } from 'lucide-react'

export default function PageLoading() {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <LucideLoader className='size-6 animate-spin' />
    </div>
  )
}
