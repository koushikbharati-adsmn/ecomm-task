import { useEffect, useRef } from 'react'

type UseIntersectionObserverProps = {
  onIntersect: () => void
  enabled?: boolean
  rootMargin?: string
  threshold?: number
}

export const useIntersectionObserver = ({
  onIntersect,
  enabled = true,
  rootMargin = '0px',
  threshold = 1.0
}: UseIntersectionObserverProps) => {
  const triggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect()
        }
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    )

    const target = triggerRef.current
    if (target) observer.observe(target)

    return () => {
      if (target) observer.unobserve(target)
    }
  }, [enabled, onIntersect, rootMargin, threshold])

  return triggerRef
}
