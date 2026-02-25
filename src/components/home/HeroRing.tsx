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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const GOLD = '#c7a05a'
    const SILVER = '#c0c0c0'
    const G = [199, 160, 90] // gold RGB
    const S = [192, 192, 192] // silver RGB
    const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    // Isometric projection helper
    const iso = (cx: number, cy: number, lx: number, ly: number, x: number, y: number) => ({
      x: cx + (x - y) * lx,
      y: cy + (x + y) * ly,
    })

    // Draw a glowing line
    function glowLine(x1: number, y1: number, x2: number, y2: number, color: number[], alpha: number, width: number, blur: number) {
      ctx!.save()
      ctx!.shadowColor = rgba(color, alpha * 0.8)
      ctx!.shadowBlur = blur
      ctx!.strokeStyle = rgba(color, alpha)
      ctx!.lineWidth = width
      ctx!.beginPath()
      ctx!.moveTo(x1, y1)
      ctx!.lineTo(x2, y2)
      ctx!.stroke()
      ctx!.restore()
    }

    // Draw circuit trace (line with right-angle turns and nodes)
    function drawCircuit(points: { x: number; y: number }[], color: number[], alpha: number, glow: number) {
      if (points.length < 2) return
      ctx!.save()
      ctx!.shadowColor = rgba(color, alpha * 0.6)
      ctx!.shadowBlur = glow
      ctx!.strokeStyle = rgba(color, alpha)
      ctx!.lineWidth = 0.8
      ctx!.beginPath()
      ctx!.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx!.lineTo(points[i].x, points[i].y)
      }
      ctx!.stroke()

      // Nodes at junctions
      for (let i = 1; i < points.length - 1; i++) {
        ctx!.fillStyle = rgba(color, alpha * 1.2)
        ctx!.beginPath()
        ctx!.arc(points[i].x, points[i].y, 1.5, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.restore()
    }

    // Pre-generate circuit paths (re-generated on each resize, but consistent during animation)
    let cachedW = 0
    let matCircuits: { points: { x: number; y: number }[]; color: number[]; speed: number }[] = []
    let apronCircuitsLeft: { points: { x: number; y: number }[]; color: number[] }[] = []
    let apronCircuitsRight: { points: { x: number; y: number }[]; color: number[] }[] = []
    let apronCircuitsFront: { points: { x: number; y: number }[]; color: number[] }[] = []

    function generateCircuits(w: number, h: number) {
      if (Math.abs(w - cachedW) < 5) return
      cachedW = w

      const cx = w / 2
      const cy = h * 0.50
      const rW = Math.min(w * 0.72, 520)
      const rH = rW * 0.35
      const apronH = rH * 0.38

      // ---- MAT CIRCUITS (top surface) ----
      matCircuits = []
      const corners = [
        { x: cx - rW / 2, y: cy },
        { x: cx, y: cy - rH * 0.22 },
        { x: cx + rW / 2, y: cy },
        { x: cx, y: cy + rH * 0.22 },
      ]

      // Radial lines from center outward
      for (let angle = 0; angle < 360; angle += 15) {
        const rad = (angle * Math.PI) / 180
        const len = rW * 0.38
        const endX = cx + Math.cos(rad) * len * 0.5
        const endY = cy + Math.sin(rad) * len * 0.22
        const midX = cx + Math.cos(rad) * len * 0.2
        const midY = cy + Math.sin(rad) * len * 0.09

        // Add right-angle turn
        const turnX = midX + (Math.random() - 0.5) * 20
        const turnY = midY

        matCircuits.push({
          points: [
            { x: cx + Math.cos(rad) * 8, y: cy + Math.sin(rad) * 3 },
            { x: midX, y: midY },
            { x: turnX, y: turnY },
            { x: endX, y: endY },
          ],
          color: angle % 30 === 0 ? G : S,
          speed: 0.5 + Math.random() * 0.5,
        })
      }

      // Grid overlay lines
      for (let i = -6; i <= 6; i++) {
        const t = i / 6
        matCircuits.push({
          points: [
            { x: cx + t * rW * 0.4, y: cy - rH * 0.18 },
            { x: cx + t * rW * 0.4, y: cy + rH * 0.18 },
          ],
          color: S,
          speed: 0,
        })
      }
      for (let i = -4; i <= 4; i++) {
        const t = i / 4
        matCircuits.push({
          points: [
            { x: cx - rW * 0.4, y: cy + t * rH * 0.18 },
            { x: cx + rW * 0.4, y: cy + t * rH * 0.18 },
          ],
          color: S,
          speed: 0,
        })
      }

      // ---- APRON CIRCUITS (sides) ----
      const genApronCircuits = (p1: { x: number; y: number }, p2: { x: number; y: number }, depth: number) => {
        const circuits: { points: { x: number; y: number }[]; color: number[] }[] = []
        for (let i = 0; i < 8; i++) {
          const t = (i + 0.5) / 8
          const topX = p1.x + (p2.x - p1.x) * t
          const topY = p1.y + (p2.y - p1.y) * t
          const botX = topX
          const botY = topY + depth

          // Zigzag pattern
          const midX1 = topX + (Math.random() - 0.5) * 15
          const midY1 = topY + depth * 0.3
          const midX2 = topX + (Math.random() - 0.5) * 15
          const midY2 = topY + depth * 0.6

          circuits.push({
            points: [
              { x: topX, y: topY + 2 },
              { x: midX1, y: midY1 },
              { x: midX2, y: midY2 },
              { x: botX, y: botY },
            ],
            color: i % 2 === 0 ? G : S,
          })
        }
        // Horizontal lines across apron
        for (let j = 0; j < 3; j++) {
          const yOff = depth * (0.2 + j * 0.3)
          circuits.push({
            points: [
              { x: p1.x + 5, y: p1.y + yOff },
              { x: p2.x - 5, y: p2.y + yOff },
            ],
            color: S,
          })
        }
        return circuits
      }

      // Left apron (corner 3→0)
      apronCircuitsLeft = genApronCircuits(corners[3], corners[0], apronH)
      // Right apron (corner 0→1... wait, visible sides)
      // Visible sides: left (3→0), front-left (0→... no)
      // Actually for isometric: visible = bottom-left and bottom-right
      apronCircuitsRight = genApronCircuits(corners[2], corners[3], apronH)
      apronCircuitsFront = [] // front-bottom
    }

    function draw() {
      const w = canvas!.getBoundingClientRect().width
      const h = canvas!.getBoundingClientRect().height
      ctx!.clearRect(0, 0, w, h)
      time += 0.006

      const cx = w / 2
      const cy = h * 0.50
      const rW = Math.min(w * 0.72, 520)
      const rH = rW * 0.35
      const postH = rW * 0.24
      const ropeGap = postH / 3.5
      const apronH = rH * 0.38

      generateCircuits(w, h)

      const corners = [
        { x: cx - rW / 2, y: cy },       // left
        { x: cx, y: cy - rH * 0.22 },    // back
        { x: cx + rW / 2, y: cy },        // right
        { x: cx, y: cy + rH * 0.22 },     // front
      ]

      // ==============================
      // GROUND SHADOW
      // ==============================
      ctx!.save()
      ctx!.shadowColor = rgba(G, 0.08)
      ctx!.shadowBlur = 60
      ctx!.fillStyle = rgba(G, 0.02)
      ctx!.beginPath()
      ctx!.ellipse(cx, cy + apronH + 20, rW * 0.55, rH * 0.3, 0, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.restore()

      // ==============================
      // APRON SIDES (visible: left & right)
      // ==============================
      // Left apron face (corners 3 → 0)
      const drawApronFace = (c1: typeof corners[0], c2: typeof corners[0], circuits: typeof apronCircuitsLeft) => {
        ctx!.fillStyle = 'rgba(8, 10, 18, 0.92)'
        ctx!.beginPath()
        ctx!.moveTo(c1.x, c1.y)
        ctx!.lineTo(c2.x, c2.y)
        ctx!.lineTo(c2.x, c2.y + apronH)
        ctx!.lineTo(c1.x, c1.y + apronH)
        ctx!.closePath()
        ctx!.fill()
        // Border
        ctx!.strokeStyle = rgba(G, 0.2)
        ctx!.lineWidth = 0.5
        ctx!.stroke()

        // Circuits on apron
        const pulseAlpha = 0.12 + Math.sin(time * 2.5) * 0.06
        circuits.forEach(c => {
          drawCircuit(c.points, c.color, pulseAlpha, 4)
        })
      }

      drawApronFace(corners[3], corners[0], apronCircuitsLeft)
      drawApronFace(corners[2], corners[3], apronCircuitsRight)

      // ==============================
      // MAT TOP SURFACE
      // ==============================
      ctx!.fillStyle = 'rgba(6, 8, 16, 0.96)'
      ctx!.beginPath()
      ctx!.moveTo(corners[0].x, corners[0].y)
      ctx!.lineTo(corners[1].x, corners[1].y)
      ctx!.lineTo(corners[2].x, corners[2].y)
      ctx!.lineTo(corners[3].x, corners[3].y)
      ctx!.closePath()
      ctx!.fill()

      // Mat border glow
      ctx!.save()
      ctx!.shadowColor = rgba(G, 0.15)
      ctx!.shadowBlur = 8
      ctx!.strokeStyle = rgba(G, 0.25)
      ctx!.lineWidth = 1
      ctx!.stroke()
      ctx!.restore()

      // ---- CIRCUIT TRACES ON MAT ----
      const gridAlpha = 0.04 + Math.sin(time * 1.5) * 0.02
      const circuitAlpha = 0.1 + Math.sin(time * 2) * 0.05

      matCircuits.forEach((c, i) => {
        const a = c.speed === 0 ? gridAlpha : circuitAlpha
        const glow = c.speed === 0 ? 2 : 6
        drawCircuit(c.points, c.color, a, glow)
      })

      // ---- CENTER GLOW (X / infinity symbol) ----
      // Multi-layer radial glow at center
      for (let layer = 3; layer >= 0; layer--) {
        const radius = 8 + layer * 12
        const alpha = layer === 0 ? 0.5 : 0.08 / (layer * 0.5)
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, rgba(G, alpha + Math.sin(time * 3) * 0.05))
        grad.addColorStop(0.5, rgba(S, alpha * 0.3))
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Center X with glow
      const xS = rW * 0.06
      ctx!.save()
      ctx!.shadowColor = rgba(G, 0.6)
      ctx!.shadowBlur = 15
      ctx!.strokeStyle = rgba(G, 0.4 + Math.sin(time * 2.5) * 0.15)
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.moveTo(cx - xS, cy - xS * 0.4)
      ctx!.lineTo(cx + xS, cy + xS * 0.4)
      ctx!.moveTo(cx + xS, cy - xS * 0.4)
      ctx!.lineTo(cx - xS, cy + xS * 0.4)
      ctx!.stroke()
      ctx!.restore()

      // Bright white-gold center dot
      const dotGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 5)
      dotGrad.addColorStop(0, 'rgba(255, 250, 240, 0.9)')
      dotGrad.addColorStop(0.4, rgba(G, 0.6))
      dotGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = dotGrad
      ctx!.beginPath()
      ctx!.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx!.fill()

      // ==============================
      // CORNER POSTS (3D gradient)
      // ==============================
      corners.forEach((c, i) => {
        const isBack = i === 1
        const baseAlpha = isBack ? 0.15 : 0.6

        // Post body — gradient for 3D effect
        const postGrad = ctx!.createLinearGradient(c.x - 3, c.y, c.x + 3, c.y)
        postGrad.addColorStop(0, rgba(G, baseAlpha * 0.6))
        postGrad.addColorStop(0.3, rgba(G, baseAlpha))
        postGrad.addColorStop(0.7, rgba(S, baseAlpha * 0.8))
        postGrad.addColorStop(1, rgba(G, baseAlpha * 0.4))

        ctx!.save()
        ctx!.shadowColor = rgba(G, baseAlpha * 0.3)
        ctx!.shadowBlur = 6
        ctx!.strokeStyle = postGrad
        ctx!.lineWidth = isBack ? 3 : 5
        ctx!.lineCap = 'round'
        ctx!.beginPath()
        ctx!.moveTo(c.x, c.y)
        ctx!.lineTo(c.x, c.y - postH)
        ctx!.stroke()
        ctx!.restore()

        // Post top cap — bright glow sphere
        if (!isBack) {
          const capGrad = ctx!.createRadialGradient(c.x, c.y - postH, 0, c.x, c.y - postH, 6)
          capGrad.addColorStop(0, 'rgba(255, 245, 220, 0.8)')
          capGrad.addColorStop(0.3, rgba(G, 0.6 + Math.sin(time * 3 + i * 1.5) * 0.2))
          capGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx!.fillStyle = capGrad
          ctx!.beginPath()
          ctx!.arc(c.x, c.y - postH, 6, 0, Math.PI * 2)
          ctx!.fill()
        }
      })

      // ==============================
      // ROPES (3D gradient per rope)
      // ==============================
      for (let r = 1; r <= 3; r++) {
        const ropeY = -r * ropeGap
        const ropeW = 4 - r * 0.5

        for (let s = 0; s < 4; s++) {
          const c1 = corners[s]
          const c2 = corners[(s + 1) % 4]
          const isBackSide = s === 1

          // Rope gradient (3D tube effect)
          const midX = (c1.x + c2.x) / 2
          const midY = (c1.y + c2.y) / 2 + ropeY
          const perpX = -(c2.y - c1.y)
          const perpY = c2.x - c1.x
          const len = Math.sqrt(perpX * perpX + perpY * perpY)
          const nx = perpX / len * 3
          const ny = perpY / len * 3

          const ropeGrad = ctx!.createLinearGradient(midX + nx, midY + ny, midX - nx, midY - ny)
          const baseA = isBackSide ? 0.08 : (r === 1 ? 0.6 : r === 2 ? 0.45 : 0.3)
          const ropeColor = r === 2 ? S : G
          ropeGrad.addColorStop(0, rgba(ropeColor, baseA * 0.5))
          ropeGrad.addColorStop(0.3, rgba(ropeColor, baseA))
          ropeGrad.addColorStop(0.7, rgba(S, baseA * 0.7))
          ropeGrad.addColorStop(1, rgba(ropeColor, baseA * 0.3))

          ctx!.save()
          if (!isBackSide) {
            ctx!.shadowColor = rgba(ropeColor, baseA * 0.4)
            ctx!.shadowBlur = 4
          }
          ctx!.strokeStyle = ropeGrad
          ctx!.lineWidth = isBackSide ? 1.5 : ropeW
          ctx!.lineCap = 'round'
          ctx!.beginPath()
          ctx!.moveTo(c1.x, c1.y + ropeY)
          ctx!.lineTo(c2.x, c2.y + ropeY)
          ctx!.stroke()
          ctx!.restore()
        }
      }

      // ==============================
      // TRAVELING PARTICLES (on ropes)
      // ==============================
      const particleCount = 12
      for (let p = 0; p < particleCount; p++) {
        const t = ((time * 0.3 + p / particleCount) % 1)
        const sideIndex = Math.floor(t * 3)
        const localT = (t * 3) % 1
        const sides = [[3, 0], [0, 1], [2, 3]]
        if (sideIndex >= sides.length) continue
        const [s1, s2] = sides[sideIndex]
        const c1 = corners[s1]
        const c2 = corners[s2]
        const ropeLevel = (p % 3) + 1
        const ry = -ropeLevel * ropeGap

        const px = c1.x + (c2.x - c1.x) * localT
        const py = c1.y + (c2.y - c1.y) * localT + ry

        const col = p % 2 === 0 ? G : S
        // Glow halo
        ctx!.save()
        ctx!.shadowColor = rgba(col, 0.8)
        ctx!.shadowBlur = 15
        const pGrad = ctx!.createRadialGradient(px, py, 0, px, py, 8)
        pGrad.addColorStop(0, rgba(col, 0.7))
        pGrad.addColorStop(0.5, rgba(col, 0.15))
        pGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = pGrad
        ctx!.beginPath()
        ctx!.arc(px, py, 8, 0, Math.PI * 2)
        ctx!.fill()
        // Core
        ctx!.fillStyle = 'rgba(255, 250, 235, 0.9)'
        ctx!.beginPath()
        ctx!.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      }

      // ==============================
      // TRAVELING PARTICLES (on mat circuits)
      // ==============================
      const matParticles = 6
      for (let p = 0; p < matParticles; p++) {
        const circuitIdx = (Math.floor(time * 2 + p * 4.1)) % matCircuits.length
        const circuit = matCircuits[circuitIdx]
        if (!circuit || circuit.points.length < 2 || circuit.speed === 0) continue

        const t = ((time * circuit.speed * 0.5 + p * 0.17) % 1)
        const totalLen = circuit.points.length - 1
        const segF = t * totalLen
        const segIdx = Math.min(Math.floor(segF), totalLen - 1)
        const segT = segF - segIdx
        const pt1 = circuit.points[segIdx]
        const pt2 = circuit.points[segIdx + 1]

        const px = pt1.x + (pt2.x - pt1.x) * segT
        const py = pt1.y + (pt2.y - pt1.y) * segT

        ctx!.save()
        ctx!.shadowColor = rgba(circuit.color, 0.6)
        ctx!.shadowBlur = 10
        const mg = ctx!.createRadialGradient(px, py, 0, px, py, 5)
        mg.addColorStop(0, 'rgba(255,250,240,0.7)')
        mg.addColorStop(0.5, rgba(circuit.color, 0.3))
        mg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = mg
        ctx!.beginPath()
        ctx!.arc(px, py, 5, 0, Math.PI * 2)
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
        {/* Ring canvas */}
        <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: '16/9' }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Title */}
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
