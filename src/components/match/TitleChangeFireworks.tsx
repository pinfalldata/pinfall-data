'use client'

import { useEffect, useRef } from 'react'

interface Spark {
  x: number; y: number; angle: number; speed: number
  size: number; color: string; life: number; maxLife: number; delay: number
}

const GOLD_COLORS = ['#c7a05a', '#e8d5a0', '#a07830', '#f5e6b8', '#ffffff', '#c0c0c0']

export function TitleChangeFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let sparks: Spark[] = []
    let frame = 0
    let lastBurst = 0
    const BURST_INTERVAL = 200 // frames between bursts (~3.3s at 60fps)

    const burst = (cx: number, cy: number, count: number, delay: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        sparks.push({
          x: cx, y: cy,
          angle,
          speed: 1 + Math.random() * 3,
          size: 1.5 + Math.random() * 2.5,
          color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
          life: 0,
          maxLife: 40 + Math.random() * 40,
          delay,
        })
      }
    }

    const createBursts = () => {
      const w = canvas.width
      const h = canvas.height
      burst(w * (0.2 + Math.random() * 0.2), h * (0.2 + Math.random() * 0.3), 18, 0)
      burst(w * (0.6 + Math.random() * 0.2), h * (0.15 + Math.random() * 0.3), 18, 6)
      burst(w * (0.35 + Math.random() * 0.3), h * (0.1 + Math.random() * 0.2), 22, 12)
      burst(w * (0.15 + Math.random() * 0.15), h * (0.4 + Math.random() * 0.2), 12, 18)
      burst(w * (0.7 + Math.random() * 0.15), h * (0.35 + Math.random() * 0.2), 12, 24)
    }

    createBursts()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // New burst cycle
      if (frame - lastBurst > BURST_INTERVAL) {
        sparks = sparks.filter(s => s.life <= s.maxLife)
        createBursts()
        lastBurst = frame
      }

      for (const s of sparks) {
        const localFrame = frame - lastBurst
        if (localFrame < s.delay) continue
        s.life++
        if (s.life > s.maxLife) continue

        const progress = s.life / s.maxLife
        const alpha = 1 - progress * progress
        const drift = s.speed * (1 - progress * 0.5)

        s.x += Math.cos(s.angle) * drift
        s.y += Math.sin(s.angle) * drift + 0.3

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * (1 - progress * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = alpha * 0.8
        ctx.fill()

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = alpha * 0.12
        ctx.fill()
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
