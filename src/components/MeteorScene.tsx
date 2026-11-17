import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useCanvasLoop } from '../lib/useCanvas'

type Star = { x: number; y: number; r: number; tw: number }
type Meteor = { x: number; y: number; len: number; v: number; w: number; life: number }

/** Cảnh cuộn: sao băng tím rơi, hành tinh tự vẽ nhô lên, thẻ kính mờ trượt vào. */
export default function MeteorScene() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const boost = useRef({ v: 0, progress: 0 })

  useCanvasLoop(canvas, () => {
    const ctx = canvas.current!.getContext('2d')!
    let stars: Star[] = []
    const meteors: Meteor[] = []
    let lastW = 0
    let spawnAcc = 0
    let prev = 0
    return (t, s) => {
      const { w, h } = s
      const dt = Math.min(0.05, prev ? t - prev : 0.016)
      prev = t
      if (w !== lastW) {
        lastW = w
        stars = Array.from({ length: Math.round((w * h) / 2600) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + 0.2, tw: Math.random() * 6 }))
      }
      ctx.clearRect(0, 0, w, h)
      for (const st of stars) {
        ctx.fillStyle = `rgba(220,210,255,${0.25 + 0.5 * Math.abs(Math.sin(t * 0.8 + st.tw))})`
        ctx.fillRect(st.x, st.y, st.r, st.r)
      }
      const b = boost.current
      b.v *= 0.94
      const intensity = 0.4 + Math.min(1, b.progress * 1.6) * 1.6 + Math.min(3, b.v)
      spawnAcc += dt * 9 * intensity
      while (spawnAcc > 1) {
        spawnAcc -= 1
        meteors.push({ x: Math.random() * w * 1.3 - w * 0.1, y: -40 - Math.random() * h * 0.3, len: 80 + Math.random() * 220, v: 500 + Math.random() * 700, w: 0.6 + Math.random() * 2.2, life: 1 })
      }
      const ang = Math.PI * 0.62 // hướng rơi chéo
      const dx = Math.cos(ang), dy = Math.sin(ang)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        const sp = m.v * (1 + b.v * 0.6) * dt
        m.x += dx * sp
        m.y += dy * sp
        if (m.y - m.len > h || m.x < -m.len) { meteors.splice(i, 1); continue }
        const tx = m.x - dx * m.len, ty = m.y - dy * m.len
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty)
        g.addColorStop(0, 'rgba(255,255,255,0.95)')
        g.addColorStop(0.08, 'rgba(200,160,255,0.8)')
        g.addColorStop(1, 'rgba(120,50,255,0)')
        ctx.strokeStyle = g
        ctx.lineWidth = m.w
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(tx, ty)
        ctx.stroke()
        const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.w * 5)
        hg.addColorStop(0, 'rgba(230,210,255,0.8)')
        hg.addColorStop(1, 'rgba(160,100,255,0)')
        ctx.fillStyle = hg
        ctx.fillRect(m.x - m.w * 5, m.y - m.w * 5, m.w * 10, m.w * 10)
      }
      ctx.globalCompositeOperation = 'source-over'
    }
  })

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            boost.current.progress = self.progress
            boost.current.v = Math.min(3, boost.current.v + Math.abs(self.getVelocity()) / 4000)
          },
        },
      })
      tl.fromTo('.planet', { yPercent: 60, scale: 0.75 }, { yPercent: -4, scale: 1.05, duration: 0.75 }, 0)
        .fromTo('.meteor-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.15 }, 0.02)
        .to('.meteor-title', { opacity: 0, y: -60, duration: 0.12 }, 0.25)
        .fromTo('.gc-1', { xPercent: 120, opacity: 0, rotate: 6 }, { xPercent: 0, opacity: 1, rotate: 0, duration: 0.18 }, 0.22)
        .to('.gc-1', { xPercent: -30, opacity: 0, duration: 0.12 }, 0.55)
        .fromTo('.gc-2', { xPercent: -120, opacity: 0, rotate: -6 }, { xPercent: 0, opacity: 1, rotate: 0, duration: 0.18 }, 0.6)
        .to('.gc-2', { opacity: 1, duration: 0.22 }, 0.78)
    },
    { scope: root },
  )

  return (
    <section className="meteor" id="meteor" ref={root}>
      <div className="meteor-pin">
        <canvas ref={canvas} className="meteor-canvas" aria-hidden="true" />
        <div className="planet" aria-hidden="true">
          <div className="planet-surface" />
          <div className="planet-atmo" />
        </div>
        <h2 className="meteor-title">Kiến thức không rơi ngẫu nhiên.</h2>
        <div className="glass-card gc-1">
          <span className="eyebrow">01 — Khởi đầu</span>
          <h3>Mỗi bài học là một tia sáng.</h3>
          <p>Kiến thức được chia nhỏ, rõ ràng, có lộ trình — để bạn tiến bộ từng ngày thay vì học dồn trước kỳ thi.</p>
        </div>
        <div className="glass-card gc-2">
          <span className="eyebrow">02 — Tăng tốc</span>
          <h3>Gom lại thành quỹ đạo của riêng bạn.</h3>
          <p>Bài tập, đề thi thử và phản hồi của giảng viên nối với nhau thành một lộ trình đo được, nhìn thấy được.</p>
        </div>
      </div>
    </section>
  )
}
