import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

const WORDS: { w: string; em?: boolean }[] = [
  { w: 'Chúng' }, { w: 'tôi' }, { w: 'ở' }, { w: 'lại' }, { w: 'vì', em: true }, { w: 'kết', em: true }, { w: 'quả', em: true }, { w: 'của' }, { w: 'bạn.' },
]

/** Câu tuyên ngôn lớn, từng chữ sáng lên theo cuộn. */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.fromTo(
        '.mw',
        { opacity: 0.12, y: 24, filter: 'blur(6px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.15, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top -20%', scrub: true },
        },
      )
      // khi nền trắng trồi lên: khối tối lùi nhẹ ra sau và tối đi
      gsap.fromTo('.manifesto-inner', { scale: 1, opacity: 1 }, { scale: 0.9, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.platform', start: 'top bottom', end: 'top top', scrub: true } })
      gsap.from('.manifesto-sub', { opacity: 0, y: 30, scrollTrigger: { trigger: '.manifesto-sub', start: 'top 90%', end: 'top 65%', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section className="manifesto" ref={root}>
      <div className="manifesto-inner">
      <p className="manifesto-text">
        {WORDS.map((x, i) => (
          <span key={i} className={`mw${x.em ? ' em' : ''}`}>{x.w} </span>
        ))}
      </p>
      <p className="manifesto-sub">Không phải vì số giờ dạy. Không phải vì số video. Mà vì điểm số, tấm bằng và công việc bạn đạt được.</p>
      </div>
    </section>
  )
}
