'use client'

import { useEffect, useState, useRef } from 'react'

interface Spark {
  id: number; x: number; y: number; angle: number; speed: number
  size: number; color: string; life: number; maxLife: number; delay: number
}

const GOLD_COLORS = ['#c7a05a', '#e8d5a0', '#a07830', '#f5e6b8', '#ffffff', '#c0c0c0']

export function TitleChangeFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [show, setShow] = useState(true)

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

    const sparks: Spark[] = []
    let idCounter = 0
    let frame = 0

    // Create burst of sparks
    const burst = (cx: number, cy: number, count: number, delay: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        const speed = 1 + Math.random() * 3
        const maxLife = 40 + Math.random() * 40
        sparks.push({
          id: idCounter++,
          x: cx, y: cy,
          angle, speed,
          size: 1.5 + Math.random() * 2.5,
          color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
          life: 0, maxLife,
          delay,
        })
      }
    }

    // Initial bursts at different positions
    const w = canvas.width
    const h = canvas.height
    burst(w * 0.3, h * 0.3, 20, 0)
    burst(w * 0.7, h * 0.25, 20, 8)
    burst(w * 0.5, h * 0.15, 25, 16)
    burst(w * 0.2, h * 0.5, 15, 24)
    burst(w * 0.8, h * 0.45, 15, 32)
    burst(w * 0.5, h * 0.6, 18, 40)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      let alive = false
      for (const s of sparks) {
        if (frame < s.delay) { alive = true; continue }
        s.life++
        if (s.life > s.maxLife) continue
        alive = true

        const progress = s.life / s.maxLife
        const alpha = 1 - progress * progress
        const drift = s.speed * (1 - progress * 0.5)

        s.x += Math.cos(s.angle) * drift
        s.y += Math.sin(s.angle) * drift + 0.3 // gravity

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * (1 - progress * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = alpha * 0.8
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = alpha * 0.15
        ctx.fill()
      }

      ctx.globalAlpha = 1

      if (alive) {
        requestAnimationFrame(animate)
      } else {
        setShow(false)
      }
    }

    const timer = setTimeout(() => animate(), 300)

    return () => {
      window.removeEventListener('resize', resize)
      clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
