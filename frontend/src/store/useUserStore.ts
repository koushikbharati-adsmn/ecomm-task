import { User } from '@/types/responses'
import { create } from 'zustand'

type UserStore = {
  user: User | null
  setUser: (user: User | null) => void
}

const getUser = (): User | null => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const useUserStore = create<UserStore>((set) => ({
  user: getUser(),
  setUser: (user) => {
    set({ user })
  }
}))
