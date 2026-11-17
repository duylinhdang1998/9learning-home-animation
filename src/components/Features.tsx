import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import SectionHead from './SectionHead'

const ITEMS: { title: string; text: string; anim: ReactNode }[] = [
  {
    title: 'Lớp học trực tiếp',
    text: 'Học live với thầy Hà Long Giang, hỏi ngay – chữa ngay, xem lại không giới hạn.',
    anim: <div className="fc-anim anim-live"><span /><span /><span /><i>LIVE</i></div>,
  },
  {
    title: 'Lộ trình cá nhân hoá',
    text: 'Bài kiểm tra đầu vào xếp bạn vào đúng điểm xuất phát, lộ trình tự điều chỉnh theo tiến độ.',
    anim: (
      <div className="fc-anim anim-path">
        <svg viewBox="0 0 200 110"><path d="M10 95 C 50 95, 60 30, 100 50 S 160 10, 190 18" /></svg>
        <b /><b /><b />
      </div>
    ),
  },
  {
    title: 'Ngân hàng đề & chấm tự động',
    text: 'Hàng nghìn câu hỏi bám sát đề thi thật, chấm điểm tức thì kèm lời giải chi tiết.',
    anim: <div className="fc-anim anim-quiz"><span>A</span><span className="ok">B</span><span>C</span><span>D</span></div>,
  },
  {
    title: 'Báo cáo tiến độ',
    text: 'Phụ huynh và học viên theo dõi điểm mạnh, điểm yếu qua biểu đồ cập nhật mỗi tuần.',
    anim: <div className="fc-anim anim-bars"><span /><span /><span /><span /><span /><span /></div>,
  },
]

/** Lưới 4 thẻ tính năng, mỗi thẻ có hoạt hình nhỏ tự dựng bằng CSS/SVG. */
export default function Features() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.from('.feature-card', {
        y: 80, opacity: 0, rotateX: 12, duration: 1.1, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.feature-grid', start: 'top 80%' },
      })
    },
    { scope: root },
  )
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  return (
    <section className="features light" id="features" ref={root}>
      <SectionHead eyebrow="Tính năng" title="Học như có thầy ngồi cạnh." />
      <div className="feature-grid">
        {ITEMS.map((it) => (
          <article key={it.title} className="feature-card" onPointerMove={tilt}>
            {it.anim}
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
