'use client'

import { useState, useEffect, useRef } from 'react'

interface StatCounterProps {
  value: number
  label: string
  suffix?: string
  delay?: number
}

export function StatCounter({ value, label, suffix = '', delay = 0 }: StatCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      let step = 0

      const interval = setInterval(() => {
        step++
        // Ease-out curve
        const progress = step / steps
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        current = Math.round(easedProgress * value)
        setCount(current)

        if (step >= steps) {
          setCount(value)
          clearInterval(interval)
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [isVisible, value, delay])

  const formatNumber = (n: number) => {
    if (n >= 1000) return n.toLocaleString('en-US')
    return n.toString()
  }

  return (
    <div
      ref={ref}
      className="glass rounded-xl p-4 lg:p-6 text-center border border-border-subtle/50 hover:border-neon-blue/30 transition-all duration-300"
    >
      <div className="stat-number text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
        <span className="text-neon-blue">{formatNumber(count)}</span>
        <span className="text-neon-pink">{suffix}</span>
      </div>
      <p className="text-text-secondary text-xs sm:text-sm font-body uppercase tracking-wider">
        {label}
      </p>
    </div>
  )
}
