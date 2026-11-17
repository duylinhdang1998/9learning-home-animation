import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import ScrollLink from './ScrollLink'

const CARDS = [
  'Học sinh làm bài', 'Lớp học hiện đại', 'Sách và tài liệu', 'Học online trên laptop',
  'Biểu đồ chứng khoán', 'Giảng đường đại học', 'Sổ sách kế toán', 'Quả địa cầu trên bàn học',
  'Tai nghe học trực tuyến', 'Thư viện', 'Lễ tốt nghiệp', 'Góc học buổi tối',
]

/**
 * Dải ~12 thẻ ảnh xếp lớp theo phối cảnh 3D thành đường chéo (dưới trái → trên phải) trên nền tím đậm.
 * Khi cuộn, cả dải trượt dọc đường chéo về phía người xem và xoay nhẹ; tiêu đề + nút hiện ở giữa dưới.
 */
export default function CardStack() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.c3-card')
      const state = { o: -1.5, turn: 0 }
      const render = () => {
        const w = window.innerWidth, h = window.innerHeight
        const narrow = w < 700
        const gx = narrow ? w * 0.11 : w * 0.072
        const gy = narrow ? h * 0.05 : h * 0.062
        const gz = narrow ? 70 : 110
        cards.forEach((el, i) => {
          const t = i - state.o // vị trí dọc dải; nhỏ = gần người xem, dưới trái
          const x = t * gx - (narrow ? w * 0.05 : w * 0.17)
          const y = -t * gy + h * 0.06
          const z = -t * gz + 120
          const ry = 38 - state.turn * 10
          // thẻ đã trượt qua người xem thì mờ đi; thẻ quá xa cũng mờ
          const a = Math.min(1, Math.max(0, (t + 1.6) / 1.4)) * Math.min(1, Math.max(0, (14 - t) / 3))
          el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateZ(-2deg)`
          el.style.opacity = String(a)
          el.style.zIndex = String(100 - i)
        })
      }
      render()
      gsap.fromTo(state, { o: -1.5, turn: 0 }, {
        o: 4.5, turn: 1, ease: 'none', onUpdate: render,
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
      })
      window.addEventListener('resize', render)

      gsap.fromTo('.c3-copy > *', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 20%', end: 'top -30%', scrub: 0.6 },
      })
      return () => window.removeEventListener('resize', render)
    },
    { scope: root },
  )

  return (
    <section className="cards3d" id="courses-gallery" ref={root}>
      <div className="c3-stage">
        <div className="c3-scene" aria-hidden="true">
          {CARDS.map((c, i) => (
            <figure className="c3-card" key={c} style={{ ['--hue' as string]: 250 + ((i * 23) % 60) }}>
              <img src={`/img/card-${String(i + 1).padStart(2, '0')}.webp`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <figcaption>{c}</figcaption>
            </figure>
          ))}
        </div>
        <div className="c3-copy">
          <h2>Mười năm, hàng nghìn học viên<br />— một lộ trình cho mỗi mục tiêu.</h2>
          <ScrollLink href="#pricing" className="btn-outline">Xem các khoá học <span aria-hidden="true">↗</span></ScrollLink>
        </div>
      </div>
    </section>
  )
}
