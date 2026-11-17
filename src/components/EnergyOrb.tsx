import { useRef } from 'react'
import { useCanvasLoop } from '../lib/useCanvas'

/** Quả cầu năng lượng: ~1100 hạt trên mặt cầu, nhiễu theo thời gian, xoay theo chuột. Vẽ hoàn toàn bằng canvas 2D. */
export default function EnergyOrb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useCanvasLoop(ref, (ctx) => {
    const N = 1100
    const pts: { x: number; y: number; z: number; s: number }[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r, s: Math.random() })
    }
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    return (t, s) => {
      const { w, h } = s
      ctx.clearRect(0, 0, w, h)
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      const cx = w / 2
      const narrow = w < 700
      const cy = h * (narrow ? 0.38 : 0.47)
      const R = Math.min(w, h) * (narrow ? 0.27 : 0.24)

      // quầng sáng nền
      ctx.globalCompositeOperation = 'lighter'
      const pulse = 1 + Math.sin(t * 1.6) * 0.04
      let g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 2.4 * pulse)
      g.addColorStop(0, 'rgba(170,120,255,0.55)')
      g.addColorStop(0.35, 'rgba(110,50,240,0.22)')
      g.addColorStop(1, 'rgba(60,10,160,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // lõi
      g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, 0, cx, cy, R * 1.02)
      g.addColorStop(0, 'rgba(255,255,255,0.9)')
      g.addColorStop(0.18, 'rgba(210,180,255,0.55)')
      g.addColorStop(0.6, 'rgba(120,60,255,0.22)')
      g.addColorStop(1, 'rgba(80,20,200,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2)
      ctx.fill()

      // hạt trên mặt cầu
      const ay = t * 0.25 + mouse.x * 0.8
      const ax = -0.35 + mouse.y * 0.5
      const cyA = Math.cos(ay), syA = Math.sin(ay), cxA = Math.cos(ax), sxA = Math.sin(ax)
      for (const p of pts) {
        const n = Math.sin(p.x * 3.1 + t * 1.3) * Math.cos(p.y * 2.7 - t * 1.1) * Math.sin(p.z * 3.3 + t * 0.9)
        const rr = 1 + n * 0.09 + Math.sin(t * 3 + p.s * 20) * 0.006
        let x = p.x * rr, y = p.y * rr, z = p.z * rr
        const x1 = x * cyA + z * syA
        const z1 = -x * syA + z * cyA
        const y1 = y * cxA - z1 * sxA
        const z2 = y * sxA + z1 * cxA
        x = x1; y = y1; z = z2
        const persp = 2.6 / (2.6 - z)
        const px = cx + x * R * persp
        const py = cy + y * R * persp
        const depth = (z + 1) / 2
        const a = 0.12 + depth * 0.75
        const size = 0.5 + depth * 1.5 + (n > 0.35 ? 1.1 : 0)
        ctx.fillStyle = n > 0.35 ? `rgba(240,225,255,${a})` : `rgba(${150 + depth * 80},${110 + depth * 70},255,${a})`
        ctx.fillRect(px - size / 2, py - size / 2, size, size)
      }

      // vòng quỹ đạo
      ctx.lineWidth = 1
      for (let k = 0; k < 3; k++) {
        const tilt = 0.28 + k * 0.22
        const rot = t * (0.2 + k * 0.07) + k
        ctx.strokeStyle = `rgba(190,160,255,${0.22 - k * 0.05})`
        ctx.beginPath()
        ctx.ellipse(cx, cy, R * (1.45 + k * 0.28), R * (1.45 + k * 0.28) * tilt, -0.3 + mouse.x * 0.1, 0, Math.PI * 2)
        ctx.stroke()
        const ex = cx + Math.cos(rot) * R * (1.45 + k * 0.28) * Math.cos(-0.3) - Math.sin(rot) * R * (1.45 + k * 0.28) * tilt * Math.sin(-0.3)
        const ey = cy + Math.cos(rot) * R * (1.45 + k * 0.28) * Math.sin(-0.3) + Math.sin(rot) * R * (1.45 + k * 0.28) * tilt * Math.cos(-0.3)
        const sg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 10)
        sg.addColorStop(0, 'rgba(255,255,255,0.95)')
        sg.addColorStop(1, 'rgba(170,120,255,0)')
        ctx.fillStyle = sg
        ctx.fillRect(ex - 10, ey - 10, 20, 20)
      }
      ctx.globalCompositeOperation = 'source-over'
    }
  })
  return <canvas ref={ref} className="orb-canvas" aria-hidden="true" />
}
