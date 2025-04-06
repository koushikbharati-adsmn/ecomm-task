import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export const formatCreatedAt = (createdAt: string | Date) => {
  const istTimeZone = 'Asia/Kolkata'
  const zonedDate = toZonedTime(new Date(createdAt), istTimeZone)

  return `${format(zonedDate, 'HH:mm')} IST - ${format(zonedDate, 'dd/MM')}`
}
