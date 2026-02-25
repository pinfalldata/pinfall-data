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
    let w = 0, h = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // ===== COLOR PALETTE (matching logo) =====
    const GOLD = [199, 160, 90]    // #c7a05a — posts, ropes, apron circuits
    const SILVER = [200, 205, 215]  // mat surface, subtle tones
    const WHITE = [240, 238, 230]   // highlights
    const RED = [180, 40, 40]       // center glow
    const DARK = [8, 10, 18]        // background surfaces

    const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    // ===== CIRCUIT PATTERN GENERATOR =====
    // Pre-compute random circuit paths (stable across frames)
    const seed = 42
    let rng = seed
    const rand = () => { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646 }

    // Generate apron circuit paths for a face
    const genApronCircuits = (count: number) => {
      const circuits: { t: number; segments: { dx: number; dy: number }[]; }[] = []
      for (let i = 0; i < count; i++) {
        const t = (i + 0.3 + rand() * 0.4) / count
        const segs: { dx: number; dy: number }[] = []
        let dir = 0 // 0=down, alternate with horizontal
        for (let s = 0; s < 4 + Math.floor(rand() * 3); s++) {
          if (dir === 0) {
            segs.push({ dx: 0, dy: 0.08 + rand() * 0.15 })
          } else {
            segs.push({ dx: (rand() - 0.5) * 0.12, dy: 0 })
          }
          dir = 1 - dir
        }
        circuits.push({ t, segments: segs })
      }
      return circuits
    }

    // Generate mat circuit traces
    const genMatCircuits = (count: number) => {
      const circuits: { angle: number; nodes: { r: number; a: number }[] }[] = []
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rand() * 0.1
        const nodes: { r: number; a: number }[] = []
        let r = 0.05
        for (let n = 0; n < 3 + Math.floor(rand() * 3); n++) {
          r += 0.06 + rand() * 0.12
          const a = angle + (rand() - 0.5) * 0.15
          nodes.push({ r: Math.min(r, 0.42), a })
        }
        circuits.push({ angle, nodes })
      }
      return circuits
    }

    const apronLeftCircuits = genApronCircuits(10)
    const apronRightCircuits = genApronCircuits(10)
    const matCircuitPaths = genMatCircuits(28)

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      time += 0.005

      const cx = w / 2
      const cy = h * 0.48
      const rW = Math.min(w * 0.74, 540)
      const rH = rW * 0.35
      const isoX = rW / 2
      const isoY = rH * 0.22
      const postH = rW * 0.26
      const ropeGap = postH / 3.5
      const apronH = rH * 0.42

      // 4 corners of the isometric diamond (mat surface)
      const C = [
        { x: cx - isoX, y: cy },         // 0: left
        { x: cx,        y: cy - isoY },   // 1: back (top)
        { x: cx + isoX, y: cy },         // 2: right
        { x: cx,        y: cy + isoY },   // 3: front (bottom)
      ]

      // Helper: interpolate between two corners
      const lerp = (a: typeof C[0], b: typeof C[0], t: number) => ({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      })

      // ============================================
      // 1. GROUND GLOW (subtle reflection)
      // ============================================
      const groundGrad = ctx!.createRadialGradient(cx, cy + apronH + 10, 0, cx, cy + apronH + 10, rW * 0.5)
      groundGrad.addColorStop(0, rgba(GOLD, 0.04))
      groundGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = groundGrad
      ctx!.beginPath()
      ctx!.ellipse(cx, cy + apronH + 10, rW * 0.5, rH * 0.25, 0, 0, Math.PI * 2)
      ctx!.fill()

      // ============================================
      // 2. APRON FACES (left side: C3→C0, right side: C2→C3)
      // ============================================
      const drawApron = (cA: typeof C[0], cB: typeof C[0], circuits: ReturnType<typeof genApronCircuits>) => {
        // Fill dark face
        ctx!.fillStyle = rgba(DARK, 0.94)
        ctx!.beginPath()
        ctx!.moveTo(cA.x, cA.y)
        ctx!.lineTo(cB.x, cB.y)
        ctx!.lineTo(cB.x, cB.y + apronH)
        ctx!.lineTo(cA.x, cA.y + apronH)
        ctx!.closePath()
        ctx!.fill()

        // Apron border (gold edge)
        ctx!.save()
        ctx!.shadowColor = rgba(GOLD, 0.15)
        ctx!.shadowBlur = 4
        ctx!.strokeStyle = rgba(GOLD, 0.35)
        ctx!.lineWidth = 1.2
        ctx!.beginPath()
        ctx!.moveTo(cA.x, cA.y)
        ctx!.lineTo(cB.x, cB.y)
        ctx!.lineTo(cB.x, cB.y + apronH)
        ctx!.lineTo(cA.x, cA.y + apronH)
        ctx!.closePath()
        ctx!.stroke()
        ctx!.restore()

        // Circuit traces on apron face
        const pulse = 0.18 + Math.sin(time * 2) * 0.06
        circuits.forEach(circuit => {
          const startPt = lerp(cA, cB, circuit.t)
          let px = startPt.x
          let py = startPt.y + 4

          ctx!.save()
          ctx!.shadowColor = rgba(GOLD, pulse * 0.5)
          ctx!.shadowBlur = 5
          ctx!.strokeStyle = rgba(GOLD, pulse)
          ctx!.lineWidth = 0.8
          ctx!.beginPath()
          ctx!.moveTo(px, py)

          const faceW = cB.x - cA.x
          const faceSlope = (cB.y - cA.y) / (faceW || 1)

          circuit.segments.forEach(seg => {
            px += seg.dx * Math.abs(faceW)
            py += seg.dy * apronH + seg.dx * faceSlope * Math.abs(faceW)
            ctx!.lineTo(px, py)
          })
          ctx!.stroke()

          // Small nodes at turns
          ctx!.fillStyle = rgba(GOLD, pulse * 1.5)
          let npx = startPt.x, npy = startPt.y + 4
          circuit.segments.forEach((seg, si) => {
            npx += seg.dx * Math.abs(faceW)
            npy += seg.dy * apronH + seg.dx * faceSlope * Math.abs(faceW)
            if (si > 0 && si < circuit.segments.length - 1) {
              ctx!.beginPath()
              ctx!.arc(npx, npy, 1.2, 0, Math.PI * 2)
              ctx!.fill()
            }
          })
          ctx!.restore()
        })

        // Horizontal accent lines across apron
        for (let i = 1; i <= 3; i++) {
          const yFrac = i / 4
          const y1 = cA.y + apronH * yFrac
          const y2 = cB.y + apronH * yFrac
          ctx!.save()
          ctx!.shadowColor = rgba(GOLD, 0.08)
          ctx!.shadowBlur = 3
          ctx!.strokeStyle = rgba(GOLD, 0.08 + Math.sin(time * 1.5 + i) * 0.03)
          ctx!.lineWidth = 0.5
          ctx!.beginPath()
          ctx!.moveTo(cA.x + 3, y1)
          ctx!.lineTo(cB.x - 3, y2)
          ctx!.stroke()
          ctx!.restore()
        }
      }

      // Draw aprons (order matters for layering)
      drawApron(C[3], C[0], apronLeftCircuits)   // left face
      drawApron(C[2], C[3], apronRightCircuits)   // right face

      // ============================================
      // 3. MAT TOP SURFACE
      // ============================================
      // Fill with a subtle gradient (silver-white with slight warmth)
      const matGrad = ctx!.createLinearGradient(C[0].x, cy, C[2].x, cy)
      matGrad.addColorStop(0, 'rgba(18, 20, 30, 0.97)')
      matGrad.addColorStop(0.5, 'rgba(22, 24, 35, 0.97)')
      matGrad.addColorStop(1, 'rgba(16, 18, 28, 0.97)')
      ctx!.fillStyle = matGrad
      ctx!.beginPath()
      ctx!.moveTo(C[0].x, C[0].y)
      ctx!.lineTo(C[1].x, C[1].y)
      ctx!.lineTo(C[2].x, C[2].y)
      ctx!.lineTo(C[3].x, C[3].y)
      ctx!.closePath()
      ctx!.fill()

      // Mat border glow
      ctx!.save()
      ctx!.shadowColor = rgba(SILVER, 0.2)
      ctx!.shadowBlur = 6
      ctx!.strokeStyle = rgba(SILVER, 0.25)
      ctx!.lineWidth = 1
      ctx!.stroke()
      ctx!.restore()

      // ---- MAT GRID (subtle silver grid) ----
      ctx!.save()
      ctx!.globalAlpha = 0.04 + Math.sin(time * 1.2) * 0.01
      ctx!.strokeStyle = rgba(SILVER, 1)
      ctx!.lineWidth = 0.4
      // Isometric grid lines (following diamond shape)
      for (let i = -8; i <= 8; i++) {
        const t = 0.5 + i / 18
        const a = lerp(C[0], C[1], t)
        const b = lerp(C[3], C[2], t)
        ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke()
      }
      for (let i = -8; i <= 8; i++) {
        const t = 0.5 + i / 18
        const a = lerp(C[0], C[3], t)
        const b = lerp(C[1], C[2], t)
        ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke()
      }
      ctx!.restore()

      // ---- MAT CIRCUIT TRACES (radial from center) ----
      const circuitPulse = 0.09 + Math.sin(time * 2.5) * 0.04
      matCircuitPaths.forEach(circuit => {
        ctx!.save()
        ctx!.shadowColor = rgba(SILVER, circuitPulse * 0.4)
        ctx!.shadowBlur = 4
        ctx!.strokeStyle = rgba(SILVER, circuitPulse)
        ctx!.lineWidth = 0.7
        ctx!.beginPath()

        // Start from center
        ctx!.moveTo(cx, cy)
        let prevPt = { x: cx, y: cy }

        circuit.nodes.forEach(node => {
          // Convert polar to isometric
          const rawX = Math.cos(node.a) * node.r * rW
          const rawY = Math.sin(node.a) * node.r * rW
          const iX = cx + rawX * 0.5 - rawY * 0
          const iY = cy + rawX * 0 + rawY * 0.22
          ctx!.lineTo(iX, iY)

          prevPt = { x: iX, y: iY }
        })
        ctx!.stroke()

        // Nodes
        ctx!.fillStyle = rgba(SILVER, circuitPulse * 2)
        circuit.nodes.forEach(node => {
          const rawX = Math.cos(node.a) * node.r * rW
          const rawY = Math.sin(node.a) * node.r * rW
          const iX = cx + rawX * 0.5
          const iY = cy + rawY * 0.22
          ctx!.beginPath()
          ctx!.arc(iX, iY, 1, 0, Math.PI * 2)
          ctx!.fill()
        })
        ctx!.restore()
      })

      // ---- CENTER X + RED GLOW (like the logo) ----
      // Red radial glow
      for (let layer = 3; layer >= 0; layer--) {
        const radius = 6 + layer * 10
        const alpha = layer === 0 ? 0.45 : 0.06 / (layer * 0.6 + 0.3)
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, rgba(RED, alpha + Math.sin(time * 3) * 0.04))
        grad.addColorStop(0.4, rgba(RED, alpha * 0.4))
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx!.fill()
      }

      // X / infinity cross at center
      const xS = rW * 0.05
      ctx!.save()
      ctx!.shadowColor = rgba(SILVER, 0.5)
      ctx!.shadowBlur = 8
      ctx!.strokeStyle = rgba(SILVER, 0.35 + Math.sin(time * 2) * 0.1)
      ctx!.lineWidth = 2.5
      ctx!.lineCap = 'round'
      ctx!.beginPath()
      ctx!.moveTo(cx - xS, cy - xS * 0.4)
      ctx!.lineTo(cx + xS, cy + xS * 0.4)
      ctx!.moveTo(cx + xS, cy - xS * 0.4)
      ctx!.lineTo(cx - xS, cy + xS * 0.4)
      ctx!.stroke()
      ctx!.restore()

      // Bright white-red center point
      const dotGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 4)
      dotGrad.addColorStop(0, 'rgba(255, 240, 235, 0.95)')
      dotGrad.addColorStop(0.3, rgba(RED, 0.5))
      dotGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = dotGrad
      ctx!.beginPath()
      ctx!.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx!.fill()

      // ============================================
      // 4. CORNER POSTS (3D metallic gold)
      // ============================================
      C.forEach((c, i) => {
        const isBack = i === 1
        const alpha = isBack ? 0.2 : 0.75

        // Post body — metallic gradient
        const pGrad = ctx!.createLinearGradient(c.x - 4, c.y, c.x + 4, c.y)
        pGrad.addColorStop(0, rgba(GOLD, alpha * 0.4))
        pGrad.addColorStop(0.2, rgba(GOLD, alpha * 0.9))
        pGrad.addColorStop(0.5, rgba(WHITE, alpha * 0.6))
        pGrad.addColorStop(0.8, rgba(GOLD, alpha * 0.8))
        pGrad.addColorStop(1, rgba(GOLD, alpha * 0.3))

        ctx!.save()
        ctx!.shadowColor = rgba(GOLD, alpha * 0.25)
        ctx!.shadowBlur = 6
        ctx!.strokeStyle = pGrad
        ctx!.lineWidth = isBack ? 3 : 6
        ctx!.lineCap = 'round'
        ctx!.beginPath()
        ctx!.moveTo(c.x, c.y)
        ctx!.lineTo(c.x, c.y - postH)
        ctx!.stroke()
        ctx!.restore()

        // Cap glow (sphere at top of post)
        if (!isBack) {
          const capGrad = ctx!.createRadialGradient(c.x, c.y - postH, 0, c.x, c.y - postH, 7)
          capGrad.addColorStop(0, rgba(WHITE, 0.7))
          capGrad.addColorStop(0.25, rgba(GOLD, 0.55 + Math.sin(time * 2.5 + i * 2) * 0.1))
          capGrad.addColorStop(0.7, rgba(GOLD, 0.15))
          capGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx!.fillStyle = capGrad
          ctx!.beginPath()
          ctx!.arc(c.x, c.y - postH, 7, 0, Math.PI * 2)
          ctx!.fill()
        }
      })

      // ============================================
      // 5. ROPES (3D metallic tubes — gold)
      // ============================================
      for (let r = 1; r <= 3; r++) {
        const ry = -r * ropeGap
        const thickness = (4 - r) * 0.9 + 1

        for (let s = 0; s < 4; s++) {
          const c1 = C[s]
          const c2 = C[(s + 1) % 4]
          const isBack = s === 1

          // Perpendicular direction for tube gradient
          const dx = c2.x - c1.x
          const dy = c2.y - c1.y
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const nx = (-dy / len) * 3
          const ny = (dx / len) * 3
          const midX = (c1.x + c2.x) / 2
          const midY = (c1.y + c2.y) / 2 + ry

          const baseA = isBack ? 0.1 : (r === 1 ? 0.65 : r === 2 ? 0.5 : 0.35)

          const ropeGrad = ctx!.createLinearGradient(midX + nx, midY + ny, midX - nx, midY - ny)
          ropeGrad.addColorStop(0, rgba(GOLD, baseA * 0.35))
          ropeGrad.addColorStop(0.25, rgba(GOLD, baseA))
          ropeGrad.addColorStop(0.5, rgba(WHITE, baseA * 0.5))
          ropeGrad.addColorStop(0.75, rgba(GOLD, baseA * 0.9))
          ropeGrad.addColorStop(1, rgba(GOLD, baseA * 0.25))

          ctx!.save()
          if (!isBack) {
            ctx!.shadowColor = rgba(GOLD, baseA * 0.3)
            ctx!.shadowBlur = 4
          }
          ctx!.strokeStyle = ropeGrad
          ctx!.lineWidth = isBack ? 1.5 : thickness
          ctx!.lineCap = 'round'
          ctx!.beginPath()
          ctx!.moveTo(c1.x, c1.y + ry)
          ctx!.lineTo(c2.x, c2.y + ry)
          ctx!.stroke()
          ctx!.restore()
        }
      }

      // ============================================
      // 6. PARTICLES — ONLY ON ROPES
      // ============================================
      const particleCount = 10
      for (let p = 0; p < particleCount; p++) {
        const t = ((time * 0.25 + p / particleCount) % 1)
        const sideIdx = Math.floor(t * 3)
        const localT = (t * 3) % 1
        // Only front-facing sides: left(3→0), front(0→... skip back), right(2→3)
        const sides = [[3, 0], [0, 3], [2, 3]]
        if (sideIdx >= sides.length) continue
        const [s1, s2] = sides[sideIdx]
        const c1 = C[s1], c2 = C[s2]
        const ropeLevel = (p % 3) + 1
        const ry = -ropeLevel * ropeGap

        const px = c1.x + (c2.x - c1.x) * localT
        const py = c1.y + (c2.y - c1.y) * localT + ry

        // Glow halo
        ctx!.save()
        ctx!.shadowColor = rgba(GOLD, 0.7)
        ctx!.shadowBlur = 12
        const pg = ctx!.createRadialGradient(px, py, 0, px, py, 7)
        pg.addColorStop(0, rgba(WHITE, 0.8))
        pg.addColorStop(0.3, rgba(GOLD, 0.4))
        pg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = pg
        ctx!.beginPath()
        ctx!.arc(px, py, 7, 0, Math.PI * 2)
        ctx!.fill()
        // Bright core
        ctx!.fillStyle = rgba(WHITE, 0.95)
        ctx!.beginPath()
        ctx!.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-10 lg:pt-14 pb-2">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-pink/3 rounded-full blur-[120px]" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
        <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: '16/9' }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
        <div className="relative -mt-2 sm:-mt-6 z-10">
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
