import { useEffect, useRef } from 'react'

export default function useFadeIn() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12 }
    )

    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll('.fade-in')
    targets.forEach(t => observer.observe(t))

    return () => { targets.forEach(t => observer.unobserve(t)) }
  }, [])

  return ref
}
