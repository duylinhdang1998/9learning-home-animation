import { useEffect, useState } from 'react'
import { useLenis } from 'lenis/react'

const fmt = (n: number) => n.toLocaleString('vi-VN')

/** Thẻ thống kê nổi góc trái dưới (số liệu minh hoạ). */
export default function StatWidget() {
  const [data, setData] = useState<number[]>(() => Array.from({ length: 16 }, (_, i) => Math.round(1180 + Math.sin(i / 2) * 40 + i * 6)))
  const [show, setShow] = useState(false)
  useLenis(({ scroll, limit }) => setShow(scroll > 60 && scroll < limit - 500))
  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => {
        const last = d[d.length - 1]
        const next = Math.max(1100, Math.min(1420, last + Math.round((Math.random() - 0.42) * 36)))
        return [...d.slice(1), next]
      })
    }, 1800)
    return () => clearInterval(id)
  }, [])
  const min = Math.min(...data) - 10
  const max = Math.max(...data) + 10
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 120},${32 - ((v - min) / (max - min)) * 30}`)
  return (
    <aside className={`stat-widget${show ? '' : ' is-off'}`} aria-label="Thống kê nhanh">
      <div className="sw-top"><span className="sw-dot" /> Đang học trực tuyến</div>
      <div className="sw-num">{fmt(data[data.length - 1])}<small>học viên</small></div>
      <svg className="sw-spark" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true">
        <path className="area" d={`M0,32 L${pts.join(' L')} L120,32 Z`} />
        <path d={`M${pts.join(' L')}`} />
      </svg>
      <div className="sw-foot">+18% so với tuần trước</div>
    </aside>
  )
}
