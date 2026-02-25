'use client'

import { useEffect, useRef } from 'react'

export function HeroRing() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const GOLD = '#c7a05a'
    const SILVER = '#c0c0c0'
    const GOLD_RGB = '199, 160, 90'
    const SILVER_RGB = '192, 192, 192'

    function draw() {
      const w = canvas!.getBoundingClientRect().width
      const h = canvas!.getBoundingClientRect().height
      ctx!.clearRect(0, 0, w, h)

      time += 0.008

      const cx = w / 2
      const cy = h * 0.52
      const ringW = Math.min(w * 0.7, 500)
      const ringH = ringW * 0.35
      const postH = ringW * 0.22
      const ropeGap = postH / 3.5

      // Draw ring platform (isometric)
      const platformTop = cy
      const platformBottom = cy + ringH * 0.35

      // Platform shadow
      ctx!.fillStyle = `rgba(${GOLD_RGB}, 0.04)`
      ctx!.beginPath()
      ctx!.ellipse(cx, platformBottom + 15, ringW * 0.55, ringH * 0.28, 0, 0, Math.PI * 2)
      ctx!.fill()

      // Platform sides
      ctx!.fillStyle = 'rgba(15, 18, 28, 0.9)'
      ctx!.strokeStyle = `rgba(${GOLD_RGB}, 0.15)`
      ctx!.lineWidth = 1

      // Front face of platform
      ctx!.beginPath()
      ctx!.moveTo(cx - ringW / 2, platformTop)
      ctx!.lineTo(cx - ringW / 2, platformBottom)
      ctx!.lineTo(cx, platformBottom + ringH * 0.22)
      ctx!.lineTo(cx + ringW / 2, platformBottom)
      ctx!.lineTo(cx + ringW / 2, platformTop)
      ctx!.closePath()
      ctx!.fill()
      ctx!.stroke()

      // Top surface
      ctx!.fillStyle = 'rgba(10, 13, 20, 0.95)'
      ctx!.beginPath()
      ctx!.moveTo(cx - ringW / 2, platformTop)
      ctx!.lineTo(cx, platformTop - ringH * 0.22)
      ctx!.lineTo(cx + ringW / 2, platformTop)
      ctx!.lineTo(cx, platformTop + ringH * 0.22)
      ctx!.closePath()
      ctx!.fill()
      ctx!.strokeStyle = `rgba(${GOLD_RGB}, 0.2)`
      ctx!.stroke()

      // Data circuit lines on platform
      ctx!.strokeStyle = `rgba(${GOLD_RGB}, ${0.08 + Math.sin(time * 2) * 0.04})`
      ctx!.lineWidth = 0.5
      for (let i = -3; i <= 3; i++) {
        ctx!.beginPath()
        ctx!.moveTo(cx + i * (ringW / 8), platformTop - ringH * 0.18)
        ctx!.lineTo(cx + i * (ringW / 8), platformTop + ringH * 0.18)
        ctx!.stroke()
      }
      for (let i = -2; i <= 2; i++) {
        ctx!.beginPath()
        ctx!.moveTo(cx - ringW / 2 + 20, platformTop + i * (ringH * 0.06))
        ctx!.lineTo(cx + ringW / 2 - 20, platformTop + i * (ringH * 0.06))
        ctx!.stroke()
      }

      // Corner posts (4 corners of isometric diamond)
      const corners = [
        { x: cx - ringW / 2, y: platformTop },          // left
        { x: cx, y: platformTop - ringH * 0.22 },       // top
        { x: cx + ringW / 2, y: platformTop },           // right
        { x: cx, y: platformTop + ringH * 0.22 },        // bottom (front)
      ]

      // Ropes (3 on each side)
      for (let r = 1; r <= 3; r++) {
        const ropeY = -r * ropeGap
        ctx!.strokeStyle = r === 1
          ? `rgba(${GOLD_RGB}, 0.5)`
          : r === 2
            ? `rgba(${SILVER_RGB}, 0.4)`
            : `rgba(${GOLD_RGB}, 0.3)`
        ctx!.lineWidth = r === 1 ? 2 : 1.5

        // Draw 4 sides
        for (let s = 0; s < 4; s++) {
          const c1 = corners[s]
          const c2 = corners[(s + 1) % 4]
          // Only draw front-facing sides (bottom, right, left) — skip back
          if (s === 1) continue // skip top-right (back)
          ctx!.beginPath()
          ctx!.moveTo(c1.x, c1.y + ropeY)
          ctx!.lineTo(c2.x, c2.y + ropeY)
          ctx!.stroke()
        }
        // Back rope (fainter)
        ctx!.strokeStyle = r === 1
          ? `rgba(${GOLD_RGB}, 0.15)`
          : `rgba(${SILVER_RGB}, 0.1)`
        ctx!.beginPath()
        ctx!.moveTo(corners[1].x, corners[1].y + ropeY)
        ctx!.lineTo(corners[2].x, corners[2].y + ropeY)
        ctx!.stroke()
      }

      // Corner posts
      corners.forEach((c, i) => {
        const alpha = (i === 1) ? 0.2 : 0.5
        ctx!.strokeStyle = `rgba(${GOLD_RGB}, ${alpha})`
        ctx!.lineWidth = 3
        ctx!.beginPath()
        ctx!.moveTo(c.x, c.y)
        ctx!.lineTo(c.x, c.y - postH)
        ctx!.stroke()

        // Post top cap glow
        const glowAlpha = 0.3 + Math.sin(time * 3 + i) * 0.15
        ctx!.fillStyle = `rgba(${GOLD_RGB}, ${glowAlpha})`
        ctx!.beginPath()
        ctx!.arc(c.x, c.y - postH, 3, 0, Math.PI * 2)
        ctx!.fill()
      })

      // Traveling neon particles on ropes
      const particleCount = 8
      for (let p = 0; p < particleCount; p++) {
        const t = ((time * 0.5 + p / particleCount) % 1)
        const sideIndex = Math.floor(t * 3)
        const localT = (t * 3) % 1

        const sides = [[3, 0], [0, 1], [2, 3]] // front-facing sides
        if (sideIndex >= sides.length) continue
        const [s1, s2] = sides[sideIndex]
        const c1 = corners[s1]
        const c2 = corners[s2]

        const px = c1.x + (c2.x - c1.x) * localT
        const py = c1.y + (c2.y - c1.y) * localT - ropeGap

        const isGold = p % 2 === 0
        const col = isGold ? GOLD_RGB : SILVER_RGB

        // Glow
        const grad = ctx!.createRadialGradient(px, py, 0, px, py, 12)
        grad.addColorStop(0, `rgba(${col}, 0.6)`)
        grad.addColorStop(1, `rgba(${col}, 0)`)
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(px, py, 12, 0, Math.PI * 2)
        ctx!.fill()

        // Core
        ctx!.fillStyle = `rgba(${col}, 0.9)`
        ctx!.beginPath()
        ctx!.arc(px, py, 2, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Center X pattern (data symbol)
      const xSize = ringW * 0.08
      ctx!.strokeStyle = `rgba(${GOLD_RGB}, ${0.15 + Math.sin(time * 1.5) * 0.08})`
      ctx!.lineWidth = 1.5
      ctx!.beginPath()
      ctx!.moveTo(cx - xSize, platformTop - xSize * 0.5)
      ctx!.lineTo(cx + xSize, platformTop + xSize * 0.5)
      ctx!.moveTo(cx + xSize, platformTop - xSize * 0.5)
      ctx!.lineTo(cx - xSize, platformTop + xSize * 0.5)
      ctx!.stroke()

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-4">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-pink/5 rounded-full blur-[120px]" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
        {/* Ring canvas */}
        <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: '16/9' }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Title */}
        <div className="relative -mt-4 sm:-mt-8 z-10">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-text-white tracking-tight mb-3">
            <span className="text-neon-blue text-glow-blue">PINFALL</span>{' '}
            <span className="text-neon-pink">DATA</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg lg:text-xl font-body max-w-xl mx-auto">
            The most comprehensive international wrestling database. Every superstar. Every match. From 1953 to today.
          </p>
        </div>
      </div>
    </section>
  )
}
