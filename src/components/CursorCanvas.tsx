import { useRef } from 'react'
import { useCanvasLoop, isTouch } from '../lib/useCanvas'

type P = { x: number; y: number; vx: number; vy: number; life: number; r: number; hue: number }

/** Vệt sáng tím theo con trỏ chuột, vẽ trên canvas cố định phủ toàn màn hình. */
export default function CursorCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useCanvasLoop(
    ref,
    (ctx) => {
      if (isTouch()) return () => {}
      const parts: P[] = []
      const m = { x: -999, y: -999, px: -999, py: -999, sx: -999, sy: -999 }
      const onMove = (e: PointerEvent) => {
        m.x = e.clientX
        m.y = e.clientY
      }
      window.addEventListener('pointermove', onMove)
      return (_t, s) => {
        ctx.clearRect(0, 0, s.w, s.h)
        if (m.x < -900) return
        if (m.sx < -900) { m.sx = m.x; m.sy = m.y }
        m.sx += (m.x - m.sx) * 0.22
        m.sy += (m.y - m.sy) * 0.22
        const dx = m.sx - m.px
        const dy = m.sy - m.py
        const speed = Math.min(Math.hypot(dx, dy), 60)
        const n = 1 + Math.floor(speed / 6)
        for (let i = 0; i < n; i++) {
          const k = i / n
          parts.push({
            x: m.px + dx * k, y: m.py + dy * k,
            vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6 - 0.15,
            life: 1, r: 1.2 + Math.random() * 2.4 + speed * 0.03, hue: 258 + Math.random() * 30,
          })
        }
        m.px = m.sx
        m.py = m.sy
        if (parts.length > 260) parts.splice(0, parts.length - 260)
        ctx.globalCompositeOperation = 'lighter'
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]
          p.x += p.vx
          p.y += p.vy
          p.life -= 0.022
          if (p.life <= 0) { parts.splice(i, 1); continue }
          ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, ${p.life * 0.55})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
          ctx.fill()
        }
        const g = ctx.createRadialGradient(m.sx, m.sy, 0, m.sx, m.sy, 140)
        g.addColorStop(0, 'rgba(150,100,255,0.16)')
        g.addColorStop(1, 'rgba(150,100,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(m.sx - 140, m.sy - 140, 280, 280)
        ctx.globalCompositeOperation = 'source-over'
      }
    },
    { fixed: true },
  )
  return <canvas ref={ref} className="cursor-canvas" aria-hidden="true" />
}
