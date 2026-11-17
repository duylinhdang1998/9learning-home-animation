import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import HeroCanvas, { type StoryState } from './HeroCanvas'

const LINES = [
  'IGCSE · Toán, Kinh tế, Kinh doanh',
  'NEU · Kế toán – Kiểm toán',
  '9invest · Đầu tư cho người mới',
  'Luyện thi 1 kèm 1 cùng thầy Giang',
]

/**
 * Hero kể chuyện theo cuộn (ghim ~6 màn hình):
 * quả cầu nhỏ giữa "10 NĂM" → cuộn thì to dần, đoạn giới thiệu hiện chồng lên → quả cầu tan biến
 * → địa cầu hiện ra, vệt sao chổi tím bay vòng quanh rồi lao vào địa cầu, chữ hiện bên cạnh.
 * Toàn bộ chạy theo một tiến độ cuộn duy nhất (scrub), nên cuộn ngược sẽ tua ngược đúng.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const story = useRef<StoryState>({ p: 0 })

  useGSAP(
    () => {
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })
      intro
        .from('.hero-canvas', { opacity: 0, duration: 2 })
        .from('.hb-left', { xPercent: -40, opacity: 0, duration: 1.6 }, 0.2)
        .from('.hb-right', { xPercent: 40, opacity: 0, duration: 1.6 }, 0.2)
        .from('.hero-tag', { opacity: 0, y: 16, duration: 1.2 }, 0.6)
        .from('.hero-bottom > *', { y: 30, opacity: 0, duration: 1.2, stagger: 0.12 }, 0.7)

      const st = { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true }
      // tiến độ cho canvas (quả cầu, địa cầu, sao chổi)
      gsap.fromTo(story.current, { p: 0 }, { p: 1, ease: 'none', scrollTrigger: st })

      // lớp chữ: tween trên lớp bọc (.hero-big, .hs-*) để không đụng intro ở từng chữ
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: st })
      tl.set({}, {}, 1) // tổng thời lượng = 1 = toàn bộ hero
        .fromTo('.hero-big', { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.08, duration: 0.12 }, 0.02)
        .fromTo('.hb-left-wrap', { xPercent: 0 }, { xPercent: -18, duration: 0.12 }, 0.02)
        .fromTo('.hb-right-wrap', { xPercent: 0 }, { xPercent: 18, duration: 0.12 }, 0.02)
        .fromTo('.hero-tag-wrap', { opacity: 1 }, { opacity: 0, duration: 0.06 }, 0.01)
        .fromTo('.hero-bottom', { opacity: 1, y: 0 }, { opacity: 0, y: -50, duration: 0.07 }, 0.01)
        .fromTo('.scroll-hint', { opacity: 1 }, { opacity: 0, duration: 0.03 }, 0)
        .fromTo('.hs-orb-text', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.07 }, 0.15)
        .to('.hs-orb-text', { opacity: 0, y: -40, duration: 0.06 }, 0.31)
        .fromTo('.hs-earth-text', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.08 }, 0.62)
        .to('.hs-earth-text', { opacity: 0, duration: 0.06 }, 0.93)

      // danh sách chạy: lần lượt làm nổi từng dòng
      const items = gsap.utils.toArray<HTMLElement>('.hero-ticker li')
      const tk = gsap.timeline({ repeat: -1 })
      items.forEach((el, i) => {
        tk.to(el, { color: '#fff', x: 10, duration: 0.5, ease: 'power2.out' }, i * 1.8)
          .to(el.querySelector('i'), { scaleX: 1, duration: 1.6, ease: 'none' }, i * 1.8)
          .to(el, { color: 'rgba(255,255,255,0.4)', x: 0, duration: 0.5 }, i * 1.8 + 1.6)
          .set(el.querySelector('i'), { scaleX: 0 }, i * 1.8 + 1.8)
      })
    },
    { scope: root },
  )

  return (
    <section className="hero" id="hero" ref={root}>
      <div className="hero-stick">
        <HeroCanvas state={story} />
        <h1 className="hero-big" aria-label="10 năm cùng 9Learning">
          <span className="hb-left-wrap"><span className="hb-left">10</span></span>
          <span className="hero-tag-wrap"><span className="hero-tag">Nền tảng học trực tuyến của thầy Hà Long Giang</span></span>
          <span className="hb-right-wrap"><span className="hb-right">NĂM</span></span>
        </h1>
        <div className="hero-bottom">
          <p className="hero-intro">
            Mười năm đồng hành cùng học sinh, sinh viên và người đi làm Việt Nam.
            <br />
            <strong>9Learning</strong> — học thật, hiểu thật, kết quả thật.
          </p>
          <ul className="hero-ticker" aria-label="Các chương trình">
            {LINES.map((l, i) => (
              <li key={l}><span>0{i + 1}</span>{l}<i /></li>
            ))}
          </ul>
        </div>
        <p className="hs-orb-text">
          Mười năm xây dựng bài giảng, đề thi và lộ trình học — từ IGCSE, kế toán – kiểm toán NEU
          đến đầu tư tài chính. Một nền tảng, một người thầy, hàng nghìn học viên đạt mục tiêu.
        </p>
        <div className="hs-earth-text">
          <h2>Tri thức không biên giới.<br />Lộ trình cho riêng bạn.</h2>
          <p>Học ở bất cứ đâu, chuẩn quốc tế, cùng giảng viên đồng hành tới kỳ thi.</p>
        </div>
        <div className="scroll-hint"><span />Cuộn xuống</div>
      </div>
    </section>
  )
}
