import { useRef, type MutableRefObject } from 'react'
import { useCanvasLoop } from '../lib/useCanvas'

export type StoryState = { p: number }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
/** tiến độ con trong đoạn [a, b] của tiến độ tổng */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => t * t * (3 - 2 * t)
const easeIn = (t: number) => t * t
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Một canvas cho cả câu chuyện hero. Mọi thứ được tính từ state.p (0→1, do ScrollTrigger scrub đặt):
 *  0.00–0.30  quả cầu năng lượng nhỏ → to gần kín màn hình
 *  0.30–0.42  quả cầu bung hạt và tan biến
 *  0.38–0.50  địa cầu hiện ra
 *  0.44–0.88  sao chổi tím bay vào, vòng quanh địa cầu (khuất sau lưng rồi vòng ra trước), lao vào bề mặt
 *  0.86–0.94  chớp sáng chỗ va chạm
 *  0.93–1.00  cảnh mờ dần để nhường cho phần sau
 * Vệt đuôi được tính lại từ quỹ đạo ở mỗi khung hình nên cuộn ngược sẽ tua ngược chính xác.
 */
export default function HeroCanvas({ state }: { state: MutableRefObject<StoryState> }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useCanvasLoop(ref, (ctx) => {
    // ---- hạt của quả cầu (phân bố đều trên mặt cầu) ----
    const N = 1500
    const golden = Math.PI * (3 - Math.sqrt(5))
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      return { x: Math.cos(th) * r, y, z: Math.sin(th) * r, s: Math.random(), d: 1 + Math.random() * 2.2 }
    })
    // ---- sao nền ----
    let stars: { x: number; y: number; r: number; tw: number }[] = []
    let starW = 0

    // ---- ảnh địa cầu (Designer tự tạo); chưa có thì vẽ địa cầu dự phòng ----
    const earth = new Image()
    let earthDisc = 0.47 // bán kính đĩa địa cầu / cạnh ảnh, đo lại khi ảnh tải xong
    let earthOk = false
    earth.onload = () => {
      earthOk = true
      try {
        // đo bán kính thật của đĩa: quét hàng giữa ảnh từ trái sang tới điểm sáng đầu tiên
        const c = document.createElement('canvas')
        c.width = 256; c.height = 256
        const x = c.getContext('2d')!
        x.drawImage(earth, 0, 0, 256, 256)
        const row = x.getImageData(0, 128, 256, 1).data
        let left = 0
        for (let i = 0; i < 128; i++) { const k = i * 4; if (row[k] + row[k + 1] + row[k + 2] > 60) { left = i; break } }
        // thu nhỏ 5% để mép cắt nằm trong đĩa, tránh viền đen ở phía tối
        earthDisc = clamp((128 - left) / 256, 0.3, 0.5) * 0.95
      } catch { /* giữ giá trị mặc định */ }
    }
    earth.src = '/img/earth.webp'

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    // ---- quỹ đạo sao chổi, u: 0→1 ----
    type Pt = { x: number; y: number; z: number }
    const orbitAt = (u: number, cx: number, cy: number, Re: number, w: number, h: number): Pt => {
      const rx = Re * 1.32, ry = Re * 0.36, tilt = -0.32
      const ell = (th: number, k: number): Pt => {
        const ex = Math.cos(th) * rx * k, ey = Math.sin(th) * ry * k
        return { x: cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), y: cy + ex * Math.sin(tilt) + ey * Math.cos(tilt), z: Math.sin(th) }
      }
      if (u < 0.22) {
        // bay vào từ góc dưới trái theo đường cong, nhập vào quỹ đạo theo đúng hướng tiếp tuyến (không gấp khúc)
        const t = u / 0.22
        const a = { x: -w * 0.1, y: h * 1.08 }
        const c1 = { x: w * 0.02, y: h * 0.82 }
        const b = ell(Math.PI, 1)
        const b2 = ell(Math.PI + 0.02, 1)
        const tl = Math.hypot(b2.x - b.x, b2.y - b.y) || 1
        const c2 = { x: b.x - ((b2.x - b.x) / tl) * Re * 0.7, y: b.y - ((b2.y - b.y) / tl) * Re * 0.7 }
        const it = 1 - t
        return {
          x: it ** 3 * a.x + 3 * it * it * t * c1.x + 3 * it * t * t * c2.x + t ** 3 * b.x,
          y: it ** 3 * a.y + 3 * it * it * t * c1.y + 3 * it * t * t * c2.y + t ** 3 * b.y,
          z: 1,
        }
      }
      if (u < 0.82) {
        // gần 1 vòng: π → 2.75π (khuất sau nửa trên, vòng ra trước ở nửa dưới)
        const t = (u - 0.22) / 0.6
        return ell(Math.PI + t * Math.PI * 1.75, 1)
      }
      // lao vào bề mặt phía trước
      const t = ease((u - 0.82) / 0.18)
      const p = ell(Math.PI * 2.75 + t * Math.PI * 0.2, lerp(1, 0.58, t))
      return { ...p, z: 1 }
    }

    return (time, s) => {
      const { w, h } = s
      const p = state.current.p
      const narrow = w < 700
      ctx.clearRect(0, 0, w, h)
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04

      // nền: tím đậm lúc đầu → đen vũ trụ khi tới địa cầu
      const space = seg(p, 0.3, 0.45)
      const bg = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.7)
      bg.addColorStop(0, `rgba(${lerp(21, 4, space)},${lerp(11, 3, space)},${lerp(46, 12, space)},1)`)
      bg.addColorStop(1, '#030207')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // sao
      if (starW !== w) {
        starW = w
        stars = Array.from({ length: Math.round((w * h) / 2400) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + 0.2, tw: Math.random() * 6 }))
      }
      const starA = 0.25 + space * 0.75
      for (const st of stars) {
        ctx.fillStyle = `rgba(220,215,255,${starA * (0.2 + 0.55 * Math.abs(Math.sin(time * 0.7 + st.tw)))})`
        ctx.fillRect(st.x, st.y - p * 120 * (st.r / 1.5), st.r, st.r)
      }

      const sceneFade = 1 - seg(p, 0.94, 1) * 0.85

      // ================= QUẢ CẦU =================
      const grow = ease(seg(p, 0, 0.3))
      const burst = seg(p, 0.3, 0.42)
      const orbAlpha = 1 - easeIn(burst)
      if (orbAlpha > 0.005) {
        const base = Math.min(w, h) * (narrow ? 0.16 : 0.12) // ~170px đường kính ở 1280×720
        const R = base * lerp(1, narrow ? 2.6 : 3.5, grow) * (1 + burst * 0.6)
        const cx = w / 2
        const cy = h * lerp(narrow ? 0.42 : 0.5, 0.5, grow)
        ctx.globalCompositeOperation = 'lighter'
        const pulse = 1 + Math.sin(time * 1.6) * 0.04
        let g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 2.2 * pulse)
        g.addColorStop(0, `rgba(170,120,255,${0.5 * orbAlpha})`)
        g.addColorStop(0.35, `rgba(110,50,240,${0.2 * orbAlpha})`)
        g.addColorStop(1, 'rgba(60,10,160,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
        g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, 0, cx, cy, R)
        g.addColorStop(0, `rgba(255,255,255,${0.75 * orbAlpha * (1 - grow * 0.6)})`)
        g.addColorStop(0.2, `rgba(200,170,255,${0.45 * orbAlpha})`)
        g.addColorStop(0.65, `rgba(110,60,255,${0.18 * orbAlpha})`)
        g.addColorStop(1, 'rgba(80,20,200,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.fill()

        const ay = time * 0.22 + mouse.x * 0.8 + p * 4
        const ax = -0.35 + mouse.y * 0.5
        const cyA = Math.cos(ay), syA = Math.sin(ay), cxA = Math.cos(ax), sxA = Math.sin(ax)
        const dotScale = lerp(1, 1.6, grow)
        for (const q of pts) {
          const n = Math.sin(q.x * 3.1 + time * 1.3) * Math.cos(q.y * 2.7 - time * 1.1) * Math.sin(q.z * 3.3 + time * 0.9)
          // khi tan: mỗi hạt bay ra xa với tốc độ riêng
          const rr = (1 + n * 0.09) * (1 + easeIn(burst) * q.d)
          let x = q.x * rr, y = q.y * rr, z = q.z * rr
          const x1 = x * cyA + z * syA
          const z1 = -x * syA + z * cyA
          const y1 = y * cxA - z1 * sxA
          const z2 = y * sxA + z1 * cxA
          x = x1; y = y1; z = z2
          const persp = 2.6 / (2.6 - clamp(z, -2, 1.8))
          const px = cx + x * R * persp
          const py = cy + y * R * persp
          const depth = clamp((z + 1) / 2)
          const a = (0.12 + depth * 0.75) * orbAlpha
          const size = (0.5 + depth * 1.5 + (n > 0.35 ? 1.1 : 0)) * dotScale
          ctx.fillStyle = n > 0.35 ? `rgba(240,225,255,${a})` : `rgba(${150 + depth * 80},${110 + depth * 70},255,${a})`
          ctx.fillRect(px - size / 2, py - size / 2, size, size)
        }
        // các sợi năng lượng chạy quanh mặt cầu
        ctx.lineWidth = 1.2 * dotScale
        for (let k = 0; k < 4; k++) {
          const a0 = time * (0.4 + k * 0.13) + k * 1.7
          ctx.strokeStyle = `rgba(200,170,255,${0.35 * orbAlpha * (1 - burst) ** 3})`
          ctx.beginPath()
          for (let j = 0; j <= 24; j++) {
            const th = a0 + j * 0.07
            const wob = Math.sin(th * 3 + k) * 0.25
            ctx.lineTo(cx + Math.cos(th) * R * (0.96 + wob * 0.05), cy + Math.sin(th + wob) * R * (0.5 + k * 0.12))
          }
          ctx.stroke()
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      // ================= ĐỊA CẦU + SAO CHỔI =================
      const eIn = ease(seg(p, 0.38, 0.52))
      if (eIn <= 0) return
      const Re = Math.min(w, h) * (narrow ? 0.4 : 0.42) * lerp(0.75, 1, eIn) * (1 + seg(p, 0.5, 1) * 0.06)
      const ecx = narrow ? w * 0.5 : w * 0.38
      const ecy = narrow ? h * 0.58 : h * 0.5 + lerp(h * 0.15, 0, eIn)
      const eAlpha = eIn * sceneFade

      const u = seg(p, 0.44, 0.88)
      const showComet = p > 0.44 && p < 0.9
      const TRAIL = 70
      const trail: Pt[] = []
      if (showComet) for (let j = 0; j < TRAIL; j++) trail.push(orbitAt(Math.max(0, u - j * 0.0042), ecx, ecy, Re, w, h))

      const drawTrail = (front: boolean) => {
        if (!showComet) return
        ctx.globalCompositeOperation = 'lighter'
        ctx.lineJoin = 'round'
        // quầng mờ liền mạch dọc đuôi
        ctx.lineCap = 'round'
        ctx.strokeStyle = `rgba(140,90,255,${0.22 * sceneFade})`
        ctx.lineWidth = 16
        ctx.beginPath()
        let open = false
        for (let j = 0; j < TRAIL * 0.7; j++) {
          const q = trail[j]
          if ((q.z >= 0) !== front) { open = false; continue }
          if (!open) { ctx.moveTo(q.x, q.y); open = true } else ctx.lineTo(q.x, q.y)
        }
        ctx.stroke()
        // lõi đuôi: nhỏ dần và nhạt dần về phía sau
        ctx.lineCap = 'butt'
        for (let j = TRAIL - 1; j > 0; j--) {
          const a = trail[j], b = trail[j - 1]
          if ((b.z >= 0) !== front) continue
          const f = 1 - j / TRAIL
          ctx.strokeStyle = `rgba(${lerp(120, 240, f)},${lerp(60, 215, f)},255,${f * f * 0.9 * sceneFade})`
          ctx.lineWidth = 0.6 + f * 6
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
        const head = trail[0]
        if ((head.z >= 0) === front) {
          const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 46)
          hg.addColorStop(0, `rgba(255,255,255,${sceneFade})`)
          hg.addColorStop(0.18, `rgba(225,200,255,${0.9 * sceneFade})`)
          hg.addColorStop(1, 'rgba(140,80,255,0)')
          ctx.fillStyle = hg
          ctx.fillRect(head.x - 46, head.y - 46, 92, 92)
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      drawTrail(false) // phần khuất sau địa cầu

      // quầng khí quyển
      ctx.globalAlpha = eAlpha
      const atmo = ctx.createRadialGradient(ecx, ecy, Re * 0.92, ecx, ecy, Re * 1.25)
      atmo.addColorStop(0, 'rgba(90,150,255,0.55)')
      atmo.addColorStop(0.35, 'rgba(70,110,255,0.18)')
      atmo.addColorStop(1, 'rgba(40,60,200,0)')
      ctx.fillStyle = atmo
      ctx.beginPath(); ctx.arc(ecx, ecy, Re * 1.25, 0, Math.PI * 2); ctx.fill()

      // đĩa địa cầu
      ctx.save()
      ctx.beginPath(); ctx.arc(ecx, ecy, Re, 0, Math.PI * 2); ctx.clip()
      if (earthOk) {
        const size = Re / earthDisc
        ctx.save()
        ctx.translate(ecx, ecy)
        ctx.rotate(-0.08 + p * 0.25) // xoay chậm theo cuộn
        ctx.drawImage(earth, -size / 2, -size / 2, size, size)
        ctx.restore()
      } else {
        const g = ctx.createRadialGradient(ecx - Re * 0.35, ecy - Re * 0.35, Re * 0.1, ecx, ecy, Re)
        g.addColorStop(0, '#5aa0ff'); g.addColorStop(0.45, '#1d4fb8'); g.addColorStop(0.8, '#0b2160'); g.addColorStop(1, '#030a24')
        ctx.fillStyle = g
        ctx.fillRect(ecx - Re, ecy - Re, Re * 2, Re * 2)
      }
      // bóng tối phía phải dưới để có khối
      const shade = ctx.createRadialGradient(ecx - Re * 0.45, ecy - Re * 0.4, Re * 0.4, ecx - Re * 0.2, ecy - Re * 0.2, Re * 1.55)
      shade.addColorStop(0, 'rgba(0,0,0,0)')
      shade.addColorStop(1, 'rgba(0,0,8,0.75)')
      ctx.fillStyle = shade
      ctx.fillRect(ecx - Re, ecy - Re, Re * 2, Re * 2)
      ctx.restore()
      // viền sáng khí quyển
      ctx.strokeStyle = `rgba(150,190,255,${0.5 * eAlpha})`
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(ecx, ecy, Re, Math.PI * 0.9, Math.PI * 1.75); ctx.stroke()
      ctx.globalAlpha = 1

      drawTrail(true) // phần bay phía trước

      // chớp sáng khi sao chổi chạm bề mặt
      const hit = seg(p, 0.86, 0.95)
      if (hit > 0 && hit < 1) {
        const pt = orbitAt(1, ecx, ecy, Re, w, h)
        const k = Math.sin(hit * Math.PI)
        const r = Re * (0.15 + hit * 0.9)
        ctx.globalCompositeOperation = 'lighter'
        const fg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r)
        fg.addColorStop(0, `rgba(255,255,255,${0.95 * k})`)
        fg.addColorStop(0.25, `rgba(200,160,255,${0.6 * k})`)
        fg.addColorStop(1, 'rgba(120,60,255,0)')
        ctx.fillStyle = fg
        ctx.fillRect(pt.x - r, pt.y - r, r * 2, r * 2)
        ctx.strokeStyle = `rgba(220,200,255,${0.7 * (1 - hit)})`
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.ellipse(pt.x, pt.y, r * 0.9, r * 0.35, -0.32, 0, Math.PI * 2); ctx.stroke()
        ctx.globalCompositeOperation = 'source-over'
      }
      // vùng va chạm còn sáng nhẹ sau đó (dấu ấn trên địa cầu)
      if (p >= 0.9) {
        const pt = orbitAt(1, ecx, ecy, Re, w, h)
        ctx.globalCompositeOperation = 'lighter'
        const gl = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, Re * 0.3)
        gl.addColorStop(0, `rgba(200,170,255,${0.35 * sceneFade})`)
        gl.addColorStop(1, 'rgba(120,60,255,0)')
        ctx.fillStyle = gl
        ctx.fillRect(pt.x - Re * 0.3, pt.y - Re * 0.3, Re * 0.6, Re * 0.6)
        ctx.globalCompositeOperation = 'source-over'
      }
    }
  })

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />
}
