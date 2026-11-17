import { useState } from 'react'
import SectionHead from './SectionHead'

const QA = [
  { q: 'Tôi có được học thử trước khi đăng ký không?', a: 'Có. Mỗi học viên mới được một buổi học thử miễn phí kèm bài kiểm tra đầu vào để chọn đúng lộ trình.' },
  { q: 'Nếu bỏ lỡ buổi live thì sao?', a: 'Mọi buổi live đều được ghi lại và đăng lên nền tảng trong vòng 24 giờ, bạn xem lại không giới hạn.' },
  { q: 'Học trên điện thoại được không?', a: 'Được. 9Learning chạy trên trình duyệt và ứng dụng di động, tiến độ đồng bộ giữa các thiết bị.' },
  { q: 'Ai là giảng viên chính?', a: 'Thầy Hà Long Giang trực tiếp phụ trách nội dung và các buổi live, cùng đội ngũ trợ giảng hỗ trợ chấm bài.' },
  { q: 'Có chứng chỉ sau khoá học không?', a: 'Có. Hoàn thành lộ trình và đạt bài thi cuối khoá, bạn nhận chứng chỉ hoàn thành của 9Learning.' },
]

/** FAQ dạng accordion, mở một câu một lúc. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="faq" id="faq">
      <SectionHead eyebrow="Hỏi đáp" title="Câu hỏi thường gặp." />
      <div className="faq-list">
        {QA.map((x, i) => {
          const isOpen = open === i
          return (
            <div key={x.q} className={`faq-item${isOpen ? ' is-open' : ''}`}>
              <button className="faq-q" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{x.q}</span><i aria-hidden="true" />
              </button>
              <div className="faq-a" id={`faq-a-${i}`} role="region"><div><p>{x.a}</p></div></div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
