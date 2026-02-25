'use client'

import { useEffect, useRef, useState } from 'react'

export function HeroRing() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)

  // Load center logo image
  useEffect(() => {
    const img = new window.Image()
    img.src = '/logo-centre-ring.png'
    img.onload = () => setLogoImg(img)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let cw = 0, ch = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      cw = rect.width
      ch = rect.height
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // ===== CONFIGURATION =====
    const ROPE_COUNT = 3

    // ===== ISOMETRIC PROJECTION =====
    const cosA = Math.cos(Math.PI / 6) // 0.866
    const sinA = Math.sin(Math.PI / 6) // 0.5

    // ===== STATIC CIRCUIT DATA (generated once) =====
    // Seeded RNG for consistency
    let rng = 42
    const srand = () => { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646 }

    // Mat circuits (silver traces radiating from center)
    interface CircuitEl { type: 'dot' | 'line'; x: number; y: number; x2?: number; y2?: number }
    const matCircuits: CircuitEl[] = []
    const step = 28
    for (let x = -1; x <= 1; x += step / 210) {
      for (let y = -1; y <= 1; y += step / 210) {
        // Skip center area (for logo)
        if (Math.abs(x) < 0.38 && Math.abs(y) < 0.38) continue
        matCircuits.push({ type: 'dot', x, y })
        if (srand() > 0.45 && x + step / 210 <= 1)
          matCircuits.push({ type: 'line', x, y, x2: x + step / 210, y2: y })
        if (srand() > 0.45 && y + step / 210 <= 1)
          matCircuits.push({ type: 'line', x, y, x2: x, y2: y + step / 210 })
      }
    }

    // Particles — only on ropes, slow
    const particles = Array.from({ length: 30 }, () => ({
      progress: srand(),
      speed: 0.0004 + srand() * 0.0008,
      rope: Math.floor(srand() * ROPE_COUNT),
      side: Math.floor(srand() * 4),
    }))

    function draw() {
      ctx!.clearRect(0, 0, cw, ch)

      // Dynamic sizing based on canvas
      const S = Math.min(cw * 0.32, 230) // half-size of ring
      const postH = S * 0.6
      const apronH = S * 0.28
      const postW = S * 0.08
      const centerX = cw / 2
      const centerY = ch * 0.48

      // Iso projection helper
      const iso = (x: number, y: number, z: number) => ({
        x: centerX + (x - y) * cosA,
        y: centerY + (x + y) * sinA - z,
      })

      // ==========================================
      // 1. GROUND SHADOW
      // ==========================================
      ctx!.save()
      ctx!.shadowBlur = 50
      ctx!.shadowColor = 'rgba(0,0,0,0.7)'
      ctx!.fillStyle = 'rgba(0,0,0,0.5)'
      ctx!.beginPath()
      const gs = S + 12
      const sh = [iso(gs, gs, -apronH - 5), iso(gs, -gs, -apronH - 5), iso(-gs, -gs, -apronH - 5), iso(-gs, gs, -apronH - 5)]
      ctx!.moveTo(sh[0].x, sh[0].y)
      sh.forEach(p => ctx!.lineTo(p.x, p.y))
      ctx!.closePath()
      ctx!.fill()
      ctx!.restore()

      // ==========================================
      // 2. APRONS (Gold sides with circuit patterns)
      // ==========================================
      const drawApron = (corner1x: number, corner1y: number, corner2x: number, corner2y: number, lightSide: boolean) => {
        const p1 = iso(corner1x, corner1y, 0)
        const p2 = iso(corner2x, corner2y, 0)
        const p3 = iso(corner2x, corner2y, -apronH)
        const p4 = iso(corner1x, corner1y, -apronH)

        // Gold gradient fill
        const g = ctx!.createLinearGradient(p1.x, p1.y, p1.x, p4.y)
        if (lightSide) {
          g.addColorStop(0, '#C5A059')
          g.addColorStop(0.4, '#B08A3E')
          g.addColorStop(0.8, '#7A5B22')
          g.addColorStop(1, '#3A2A0E')
        } else {
          g.addColorStop(0, '#A8883A')
          g.addColorStop(0.4, '#8B6B28')
          g.addColorStop(0.8, '#5C421A')
          g.addColorStop(1, '#2A1A08')
        }

        ctx!.fillStyle = g
        ctx!.beginPath()
        ctx!.moveTo(p1.x, p1.y); ctx!.lineTo(p2.x, p2.y)
        ctx!.lineTo(p3.x, p3.y); ctx!.lineTo(p4.x, p4.y)
        ctx!.closePath()
        ctx!.fill()

        // Apron border (top edge highlight)
        ctx!.strokeStyle = 'rgba(254, 225, 133, 0.3)'
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.moveTo(p1.x, p1.y); ctx!.lineTo(p2.x, p2.y)
        ctx!.stroke()

        // Gold circuit lines on apron (STATIC)
        ctx!.strokeStyle = 'rgba(255, 215, 0, 0.15)'
        ctx!.lineWidth = 0.8
        // Horizontal lines
        for (let i = 1; i <= 5; i++) {
          const t = i / 6
          const s0 = iso(corner1x, corner1y, -apronH * t)
          const e0 = iso(corner2x, corner2y, -apronH * t)
          ctx!.beginPath()
          ctx!.moveTo(s0.x, s0.y); ctx!.lineTo(e0.x, e0.y)
          ctx!.stroke()
        }
        // Vertical circuit segments (zigzag-style)
        ctx!.strokeStyle = 'rgba(255, 215, 0, 0.12)'
        const segments = 8
        for (let i = 1; i < segments; i++) {
          const t = i / segments
          const top = iso(
            corner1x + (corner2x - corner1x) * t,
            corner1y + (corner2y - corner1y) * t,
            0
          )
          const bot = iso(
            corner1x + (corner2x - corner1x) * t,
            corner1y + (corner2y - corner1y) * t,
            -apronH
          )
          ctx!.beginPath()
          ctx!.moveTo(top.x, top.y)
          // Zigzag
          const mid1Y = top.y + (bot.y - top.y) * 0.33
          const mid2Y = top.y + (bot.y - top.y) * 0.66
          const offset = (i % 2 === 0 ? 1 : -1) * 4
          ctx!.lineTo(top.x + offset, mid1Y)
          ctx!.lineTo(top.x - offset, mid2Y)
          ctx!.lineTo(bot.x, bot.y)
          ctx!.stroke()
        }

        // Circuit node dots
        ctx!.fillStyle = 'rgba(255, 215, 0, 0.2)'
        for (let i = 1; i < segments; i++) {
          for (let j = 1; j <= 3; j++) {
            const t = i / segments
            const z = -apronH * (j / 4)
            const p = iso(
              corner1x + (corner2x - corner1x) * t,
              corner1y + (corner2y - corner1y) * t,
              z
            )
            ctx!.beginPath()
            ctx!.arc(p.x, p.y, 1, 0, Math.PI * 2)
            ctx!.fill()
          }
        }
      }

      // Right apron (front-right visible face)
      drawApron(S, S, S, -S, false)
      // Left apron (front-left visible face)
      drawApron(S, S, -S, S, true)

      // ==========================================
      // 3. MAT SURFACE (Silver/White)
      // ==========================================
      const matCorners = [iso(S, S, 0), iso(S, -S, 0), iso(-S, -S, 0), iso(-S, S, 0)]

      // Metallic mat gradient
      const matG = ctx!.createLinearGradient(matCorners[2].x, matCorners[2].y, matCorners[0].x, matCorners[0].y)
      matG.addColorStop(0, '#D8D8D8')
      matG.addColorStop(0.3, '#EAEAEA')
      matG.addColorStop(0.5, '#F5F5F5')
      matG.addColorStop(0.7, '#E8E8E8')
      matG.addColorStop(1, '#D0D0D0')

      ctx!.fillStyle = matG
      ctx!.beginPath()
      ctx!.moveTo(matCorners[0].x, matCorners[0].y)
      matCorners.forEach(p => ctx!.lineTo(p.x, p.y))
      ctx!.closePath()
      ctx!.fill()

      // Mat edge highlight
      ctx!.strokeStyle = 'rgba(199, 160, 90, 0.4)'
      ctx!.lineWidth = 1.5
      ctx!.stroke()

      // ==========================================
      // 4. SILVER CIRCUITS ON MAT (STATIC)
      // ==========================================
      ctx!.strokeStyle = '#C0C0C0'
      ctx!.lineWidth = 1
      ctx!.fillStyle = '#B8B8B8'

      matCircuits.forEach(c => {
        if (c.type === 'dot') {
          const p = iso(c.x * S, c.y * S, 0)
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
          ctx!.fill()
        } else if (c.x2 !== undefined && c.y2 !== undefined) {
          const p1 = iso(c.x * S, c.y * S, 0)
          const p2 = iso(c.x2 * S, c.y2 * S, 0)
          ctx!.beginPath()
          ctx!.moveTo(p1.x, p1.y)
          ctx!.lineTo(p2.x, p2.y)
          ctx!.stroke()
        }
      })

      // ==========================================
      // 5. LOGO IMAGE AT CENTER (isometric perspective)
      // ==========================================
      if (logoImg) {
        ctx!.save()
        const center = iso(0, 0, 1)
        ctx!.translate(center.x, center.y)
        // Isometric skew: scale Y to ~50% and rotate 45deg
        ctx!.scale(1, 0.5)
        ctx!.rotate(Math.PI / 4)
        const imgSize = S * 0.7
        ctx!.drawImage(logoImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize)
        ctx!.restore()
      }

      // ==========================================
      // 6. CORNER POSTS (3D box shape)
      // ==========================================
      const drawPost = (px: number, py: number) => {
        const w = postW / 2

        // Right face (darker gold)
        const f1 = [iso(px + w, py + w, 0), iso(px + w, py - w, 0), iso(px + w, py - w, postH), iso(px + w, py + w, postH)]
        ctx!.fillStyle = '#8B6B32'
        ctx!.beginPath()
        ctx!.moveTo(f1[0].x, f1[0].y)
        f1.forEach(p => ctx!.lineTo(p.x, p.y))
        ctx!.closePath()
        ctx!.fill()
        ctx!.strokeStyle = 'rgba(254,225,133,0.15)'
        ctx!.lineWidth = 0.5
        ctx!.stroke()

        // Left face (lighter gold)
        const f2 = [iso(px + w, py + w, 0), iso(px - w, py + w, 0), iso(px - w, py + w, postH), iso(px + w, py + w, postH)]
        ctx!.fillStyle = '#C5A059'
        ctx!.beginPath()
        ctx!.moveTo(f2[0].x, f2[0].y)
        f2.forEach(p => ctx!.lineTo(p.x, p.y))
        ctx!.closePath()
        ctx!.fill()
        ctx!.strokeStyle = 'rgba(254,225,133,0.15)'
        ctx!.stroke()

        // Top face (brightest gold)
        const t = [iso(px + w, py + w, postH), iso(px + w, py - w, postH), iso(px - w, py - w, postH), iso(px - w, py + w, postH)]
        ctx!.fillStyle = '#FEE185'
        ctx!.beginPath()
        ctx!.moveTo(t[0].x, t[0].y)
        t.forEach(p => ctx!.lineTo(p.x, p.y))
        ctx!.closePath()
        ctx!.fill()

        // Top glow
        const capCenter = iso(px, py, postH)
        const glow = ctx!.createRadialGradient(capCenter.x, capCenter.y, 0, capCenter.x, capCenter.y, postW)
        glow.addColorStop(0, 'rgba(254, 225, 133, 0.5)')
        glow.addColorStop(1, 'rgba(254, 225, 133, 0)')
        ctx!.fillStyle = glow
        ctx!.beginPath()
        ctx!.arc(capCenter.x, capCenter.y, postW, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Draw back posts first, then front (correct z-order)
      drawPost(-S, -S) // back-left
      drawPost(S, -S)   // back-right
      drawPost(-S, S)    // front-left
      drawPost(S, S)     // front-right

      // ==========================================
      // 7. ROPES (3 thick gold ropes)
      // ==========================================
      for (let r = 1; r <= ROPE_COUNT; r++) {
        const h = (postH / (ROPE_COUNT + 1)) * r

        // Draw all 4 sides
        const ropeCorners = [
          iso(S, S, h), iso(S, -S, h), iso(-S, -S, h), iso(-S, S, h)
        ]

        // Back ropes (fainter)
        ctx!.strokeStyle = 'rgba(197, 160, 89, 0.25)'
        ctx!.lineWidth = 3
        ctx!.beginPath()
        ctx!.moveTo(ropeCorners[1].x, ropeCorners[1].y)
        ctx!.lineTo(ropeCorners[2].x, ropeCorners[2].y)
        ctx!.stroke()
        ctx!.beginPath()
        ctx!.moveTo(ropeCorners[2].x, ropeCorners[2].y)
        ctx!.lineTo(ropeCorners[3].x, ropeCorners[3].y)
        ctx!.stroke()

        // Front ropes (bright with glow)
        ctx!.save()
        ctx!.shadowColor = 'rgba(199, 160, 90, 0.3)'
        ctx!.shadowBlur = 4

        // Rope gradient for 3D tube effect
        const ropeThick = 4.5 - r * 0.4
        ctx!.lineWidth = ropeThick
        ctx!.lineCap = 'round'

        // Right side
        ctx!.strokeStyle = 'rgba(197, 160, 89, 0.75)'
        ctx!.beginPath()
        ctx!.moveTo(ropeCorners[0].x, ropeCorners[0].y)
        ctx!.lineTo(ropeCorners[1].x, ropeCorners[1].y)
        ctx!.stroke()

        // Left side
        ctx!.strokeStyle = 'rgba(210, 175, 100, 0.75)'
        ctx!.beginPath()
        ctx!.moveTo(ropeCorners[3].x, ropeCorners[3].y)
        ctx!.lineTo(ropeCorners[0].x, ropeCorners[0].y)
        ctx!.stroke()

        ctx!.restore()
      }

      // ==========================================
      // 8. PARTICLES — ONLY ON ROPES (slow)
      // ==========================================
      particles.forEach(p => {
        p.progress += p.speed
        if (p.progress > 1) p.progress = 0

        const h = (postH / (ROPE_COUNT + 1)) * (p.rope + 1)
        const t = p.progress

        // Travel around the ring perimeter
        let px: number, py: number
        const seg = t * 4
        const localT = seg % 1
        if (seg < 1) {
          px = S; py = S - localT * S * 2 // front→right
        } else if (seg < 2) {
          px = S - localT * S * 2; py = -S // right→back
        } else if (seg < 3) {
          px = -S; py = -S + localT * S * 2 // back→left
        } else {
          px = -S + localT * S * 2; py = S // left→front
        }

        const pos = iso(px, py, h)

        // Only draw on front-facing sides (seg 0 and 3, partially 1 and 2)
        const alpha = (seg < 1 || seg >= 3) ? 0.9 : 0.3

        // Glow
        ctx!.save()
        ctx!.shadowBlur = 12
        ctx!.shadowColor = `rgba(255, 240, 200, ${alpha * 0.8})`
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx!.beginPath()
        ctx!.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2)
        ctx!.fill()
        // Outer glow
        const glow = ctx!.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 8)
        glow.addColorStop(0, `rgba(254, 225, 133, ${alpha * 0.5})`)
        glow.addColorStop(1, 'rgba(254, 225, 133, 0)')
        ctx!.fillStyle = glow
        ctx!.beginPath()
        ctx!.arc(pos.x, pos.y, 8, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [logoImg])

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-10 lg:pt-14 pb-2">
      {/* Subtle background glows */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-neon-blue/4 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/3 w-60 h-60 bg-neon-pink/3 rounded-full blur-[100px]" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
        {/* Canvas container */}
        <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: '16/10' }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Title below ring */}
        <div className="relative -mt-2 sm:-mt-4 z-10">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-text-white tracking-tight mb-3">
            <span className="text-neon-blue text-glow-blue">PINFALL</span>{' '}
            <span className="text-neon-pink">DATA</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg lg:text-xl font-body max-w-xl mx-auto">
            The most comprehensive international WWE database. Every superstar. Every match. From 1953 to today.
          </p>
        </div>
      </div>
    </section>
  )
}
