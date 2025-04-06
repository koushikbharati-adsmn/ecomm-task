import { DefaultEventsMap, Socket } from 'socket.io'

export interface User {
  id?: string
  role?: string
  email?: string
  name?: string
}

export interface AuthenticatedSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  user?: {
    id: string
  }
}
