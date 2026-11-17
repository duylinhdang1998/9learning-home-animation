import { useState, type FormEvent } from 'react'

type Form = { name: string; phone: string; email: string; course: string; goal: string }
const EMPTY: Form = { name: '', phone: '', email: '', course: 'IGCSE', goal: '' }

/** Form đăng ký tư vấn — chỉ giao diện, KHÔNG gửi dữ liệu đi đâu. */
export default function ContactForm() {
  const [f, setF] = useState<Form>(EMPTY)
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({})
  const [done, setDone] = useState(false)
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const n: typeof err = {}
    if (!f.name.trim()) n.name = 'Vui lòng nhập họ tên'
    if (!/^0\d{9}$/.test(f.phone.replace(/\s/g, ''))) n.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) n.email = 'Email chưa đúng định dạng'
    setErr(n)
    if (Object.keys(n).length === 0) { setDone(true); setF(EMPTY) }
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-copy reveal">
        <span className="eyebrow">Đăng ký tư vấn</span>
        <h2>Bắt đầu với một buổi học thử.</h2>
        <p>Để lại thông tin, chúng tôi sẽ gọi lại trong 24 giờ.</p>
      </div>
      <form className="contact-form" noValidate onSubmit={submit}>
        <label className={err.name ? 'has-err' : ''}><span>Họ và tên *</span><input value={f.name} onChange={set('name')} placeholder="Nguyễn Văn A" /><em>{err.name}</em></label>
        <label className={err.phone ? 'has-err' : ''}><span>Số điện thoại *</span><input type="tel" value={f.phone} onChange={set('phone')} placeholder="09xx xxx xxx" /><em>{err.phone}</em></label>
        <label className={err.email ? 'has-err' : ''}><span>Email</span><input type="email" value={f.email} onChange={set('email')} placeholder="ban@email.com" /><em>{err.email}</em></label>
        <label><span>Khoá học quan tâm</span>
          <select value={f.course} onChange={set('course')}>
            <option>IGCSE</option><option>NEU Kế toán – Kiểm toán</option><option>9invest</option><option>1 kèm 1</option>
          </select>
        </label>
        <label className="full"><span>Mục tiêu của bạn</span><textarea rows={3} value={f.goal} onChange={set('goal')} placeholder="Ví dụ: đạt A* IGCSE Economics trong 6 tháng" /></label>
        <button type="submit" className="btn btn-primary full">Gửi đăng ký</button>
        <p className="form-msg full" role="status" aria-live="polite">{done ? 'Đã ghi nhận! (Bản xem trước — form chưa gửi dữ liệu đi đâu.)' : ''}</p>
      </form>
    </section>
  )
}
