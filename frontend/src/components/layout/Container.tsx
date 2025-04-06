import { PropsWithChildren } from 'react'

export default function Container({ children }: PropsWithChildren) {
  return <div className='h-full w-full flex-1 overflow-y-auto'>{children}</div>
}
