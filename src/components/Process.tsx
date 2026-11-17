import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

const STEPS = [
  { t: 'Đăng ký', d: 'Để lại thông tin, đội ngũ tư vấn gọi lại trong 24 giờ để hiểu mục tiêu của bạn.' },
  { t: 'Học thử', d: 'Một buổi học thử miễn phí và bài kiểm tra đầu vào để chọn đúng lộ trình.' },
  { t: 'Học', d: 'Học theo lộ trình với video, lớp live, bài tập và phản hồi trực tiếp từ giảng viên.' },
  { t: 'Thi & Chứng chỉ', d: 'Thi thử sát đề thật, sau đó thi chính thức và nhận chứng chỉ hoàn thành khoá học.' },
]

/** Quy trình 4 bước: desktop ghim màn hình và trượt ngang theo cuộn; mobile hiện dọc từng bước. */
export default function Process() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const track = root.current!.querySelector<HTMLElement>('.process-track')!
        const dist = () => track.scrollWidth - window.innerWidth + 120
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
        })
        tl.to(track, { x: () => -dist(), duration: 1 }, 0)
          .fromTo('.process-fill', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        gsap.utils.toArray<HTMLElement>('.step:not(.step-photo)').forEach((el, i) => {
          tl.fromTo(el, { opacity: 0.25, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.12 }, Math.max(0, i * 0.25 - 0.05))
          tl.fromTo(`.pdot:nth-child(${i + 1})`, { background: 'rgba(13,10,23,0.12)' }, { background: '#7b3cff', duration: 0.05 }, i * 0.25)
        })
      })
      mm.add('(max-width: 899px)', () => {
        gsap.utils.toArray<HTMLElement>('.step').forEach((el) => {
          gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
        })
        gsap.fromTo('.process-fill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.process-track', start: 'top 70%', end: 'bottom 70%', scrub: true } })
      })
    },
    { scope: root },
  )
  return (
    <section className="process light" id="process" ref={root}>
      <div className="process-pin">
        <header className="section-head">
          <span className="eyebrow">Quy trình</span>
          <h2>Bốn bước tới tấm chứng chỉ.</h2>
        </header>
        <div className="process-line">
          <i className="process-fill" />
          <div className="pdots">{STEPS.map((s) => <span key={s.t} className="pdot" />)}</div>
        </div>
        <div className="process-track">
          <figure className="step step-photo"><img src="/img/process.webp" alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /><figcaption>Từ buổi học thử đầu tiên tới tấm chứng chỉ.</figcaption></figure>
          {STEPS.map((s, i) => (
            <article className="step" key={s.t}>
              <span className="step-n">0{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
