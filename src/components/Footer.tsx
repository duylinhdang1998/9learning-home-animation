import ScrollLink from './ScrollLink'
import PhysicsBlocks from './PhysicsBlocks'
import Logo from './Logo'

/** Footer có khối rơi va nhau bằng Matter.js. */
export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h2>Học thật.<br />Kết quả thật.</h2>
          <ScrollLink href="#contact" className="btn btn-primary">Học thử miễn phí</ScrollLink>
        </div>
        <div className="footer-cols">
          <div><h4>Khoá học</h4><ScrollLink href="#pricing">IGCSE</ScrollLink><ScrollLink href="#pricing">NEU Kế toán – Kiểm toán</ScrollLink><ScrollLink href="#pricing">9invest</ScrollLink></div>
          <div><h4>9Learning</h4><ScrollLink href="#platform">Giảng viên</ScrollLink><ScrollLink href="#features">Blog</ScrollLink><ScrollLink href="#faq">Hỏi đáp</ScrollLink></div>
          <div><h4>Liên hệ</h4><span>Hotline: 0xxx xxx xxx</span><span>Email: hello@9learning.vn</span><span>Hà Nội, Việt Nam</span></div>
        </div>
      </div>
      <PhysicsBlocks />
      <div className="footer-bottom">
        <span className="fb-logo"><Logo size={22} /> © 2026 9Learning</span>
        <span className="fb-hint">Kéo thử các khối ↑</span>
        <ScrollLink href="#hero">Lên đầu trang ↑</ScrollLink>
      </div>
    </footer>
  )
}
