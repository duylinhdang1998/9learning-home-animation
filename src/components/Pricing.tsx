import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import ScrollLink from './ScrollLink'
import SectionHead from './SectionHead'

const PLANS = [
  { name: 'IGCSE', desc: 'Toán, Kinh tế, Kinh doanh — chương trình Cambridge.', price: '2.900.000', unit: 'đ / tháng', perks: ['8 buổi live / tháng', 'Đề thi thử theo từng chương', 'Báo cáo cho phụ huynh'], cta: 'Đăng ký' },
  { name: 'NEU Kế toán – Kiểm toán', desc: 'Bám sát giáo trình, ôn thi học phần và cuối kỳ.', price: '1.900.000', unit: 'đ / học phần', perks: ['Video bài giảng trọn học phần', 'Ngân hàng đề NEU', 'Nhóm hỏi đáp riêng'], cta: 'Đăng ký', featured: true },
  { name: '9invest', desc: 'Đầu tư tài chính cá nhân cho người mới bắt đầu.', price: '3.500.000', unit: 'đ / khoá', perks: ['12 bài học nền tảng', 'Bài tập phân tích thực tế', 'Cộng đồng 9invest'], cta: 'Đăng ký' },
  { name: '1 kèm 1', desc: 'Lộ trình riêng cùng thầy Hà Long Giang.', price: 'Liên hệ', unit: '', perks: ['Lịch học linh hoạt', 'Chữa bài từng câu', 'Cam kết đầu ra'], cta: 'Nhận tư vấn' },
]

/** Bảng 4 khoá/gói học. Giá là số minh hoạ. */
export default function Pricing() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.from('.price-card', { y: 100, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.price-grid', start: 'top 80%' } })
    },
    { scope: root },
  )
  return (
    <section className="pricing" id="pricing" ref={root}>
      <SectionHead eyebrow="Khoá học" title="Chọn chương trình phù hợp." />
      <div className="price-grid">
        {PLANS.map((p) => (
          <article key={p.name} className={`price-card${p.featured ? ' featured' : ''}`}>
            {p.featured && <span className="badge">Phổ biến nhất</span>}
            <h3>{p.name}</h3>
            <p className="pc-desc">{p.desc}</p>
            <div className="pc-price">{p.price}{p.unit && <small>{p.unit}</small>}</div>
            <ul>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
            <ScrollLink href="#contact" className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'}`}>{p.cta}</ScrollLink>
          </article>
        ))}
      </div>
      <p className="note">* Giá minh hoạ, sẽ cập nhật theo bảng giá chính thức.</p>
    </section>
  )
}
