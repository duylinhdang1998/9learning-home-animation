import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

const STATS = [
  { label: 'Tiến độ khoá', value: 72, unit: '%', big: true },
  { label: 'Điểm thi thử', value: 8.6, decimals: 1 },
  { label: 'Chuỗi ngày học', value: 23 },
]

/** Khối giới thiệu nền tảng học: mô phỏng bảng điều khiển bằng HTML/CSS. */
export default function Platform() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.from('.platform-title, .platform-copy > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.fromTo('.platform-photo img', { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.platform-photo', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.platform-mock', { rotateX: 22, rotateY: -14, y: 80, scale: 0.9 }, { rotateX: 0, rotateY: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.platform-stage', start: 'top bottom', end: 'center center', scrub: true } })
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count)
        const dec = Number(el.dataset.decimals || 0)
        const o = { v: 0 }
        gsap.to(o, {
          v: target, duration: 2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ',') },
        })
      })
      gsap.from('.pm-progress i', { scaleX: 0, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: '.pm-progress', start: 'top 85%' } })
      gsap.from('.pm-list > div', { x: 30, opacity: 0, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: '.pm-list', start: 'top 88%' } })
    },
    { scope: root },
  )
  return (
    <section className="platform light" id="platform" ref={root}>
      <h2 className="platform-title"><span className="eyebrow">Nền tảng 9Learning</span>Một nơi cho mọi thứ bạn cần để học.</h2>
      <div className="platform-copy">
        <p>Video bài giảng, tài liệu, bài tập, lịch học live và trao đổi với giảng viên — tất cả nằm trong một bảng điều khiển gọn gàng, dùng được trên máy tính lẫn điện thoại.</p>
        <ul className="ticks">
          <li>Giảng viên chính: thầy Hà Long Giang</li>
          <li>Đồng bộ tiến độ trên mọi thiết bị</li>
          <li>Nhóm hỏi đáp riêng cho từng khoá</li>
        </ul>
      </div>
      <div className="platform-stage">
        <figure className="platform-photo"><img src="/img/platform.webp" alt="Học viên học trên nền tảng 9Learning" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /></figure>
        <div className="platform-mock" aria-hidden="true">
          <div className="pm-bar"><i /><i /><i /><span>app.9learning.vn</span></div>
          <div className="pm-body">
            <div className="pm-side"><b className="on" /><b /><b /><b /><b /></div>
            <div className="pm-main">
              <div className="pm-hello">Chào Minh 👋 <small>Hôm nay: Chương 4 — Kế toán quản trị</small></div>
              <div className="pm-row">
                {STATS.map((s) => (
                  <div key={s.label} className={`pm-card${s.big ? ' big' : ''}`}>
                    <span>{s.label}</span>
                    <strong data-count={s.value} data-decimals={s.decimals ?? 0}>0</strong>
                    {s.unit && <em>{s.unit}</em>}
                    {s.big && <div className="pm-progress"><i /></div>}
                  </div>
                ))}
              </div>
              <div className="pm-list">
                <div><b>▶</b> Bài 4.2 — Chi phí biến đổi &amp; chi phí cố định <small>18:42</small></div>
                <div><b>✎</b> Bài tập 4.2 — 20 câu trắc nghiệm <small>Hạn: Thứ 6</small></div>
                <div><b>●</b> Live: Chữa đề IGCSE Economics <small>20:00</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
