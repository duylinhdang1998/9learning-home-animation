import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

const ROW_A = ['IGCSE', 'NEU Kế toán – Kiểm toán', '9invest', 'Luyện thi 1 kèm 1']
const ROW_B = ['Học thật', 'Hiểu thật', 'Kết quả thật', 'Cùng thầy Hà Long Giang']

/** Dải chữ chạy cỡ lớn trên nền trắng: hai hàng trượt ngược chiều nhau theo cuộn. */
export default function Marquee() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 }
      gsap.fromTo('.mq-a', { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: st })
      gsap.fromTo('.mq-b', { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: st })
    },
    { scope: root },
  )
  const row = (items: string[]) => [...items, ...items, ...items].map((t, i) => <span key={i}>{t}<i>✦</i></span>)
  return (
    <section className="marquee light" aria-label="Chương trình của 9Learning" ref={root}>
      <div className="mq-row mq-a">{row(ROW_A)}</div>
      <div className="mq-row mq-b outline">{row(ROW_B)}</div>
    </section>
  )
}
