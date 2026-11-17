import { useState } from 'react'
import { useLenis } from 'lenis/react'
import ScrollLink from './ScrollLink'
import Logo from './Logo'

const NAV = [
  { href: '#pricing', label: 'Khoá học' },
  { href: '#platform', label: 'Giảng viên' },
  { href: '#features', label: 'Blog' },
  { href: '#contact', label: 'Liên hệ' },
]

/** Header cố định + menu mobile + nút dọc dính mép phải. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  useLenis(({ scroll, direction }) => {
    setScrolled(scroll > 40)
    setHidden(scroll > 600 && direction === 1 && !open)
  }, [open])

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`}>
        <ScrollLink href="#hero" className="logo" aria-label="9Learning – về đầu trang">
          <Logo />
          <span>9Learning</span>
        </ScrollLink>
        <nav className="nav" aria-label="Điều hướng chính">
          {NAV.map((n) => (
            <ScrollLink key={n.label} href={n.href}>{n.label}</ScrollLink>
          ))}
        </nav>
        <ScrollLink href="#contact" className="btn btn-primary btn-header">Học thử miễn phí</ScrollLink>
        <button className={`burger${open ? ' is-open' : ''}`} aria-label="Mở menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </header>
      <div className={`mobile-menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        {NAV.map((n) => (
          <ScrollLink key={n.label} href={n.href} onNavigate={() => setOpen(false)}>{n.label}</ScrollLink>
        ))}
        <ScrollLink href="#contact" className="btn btn-primary" onNavigate={() => setOpen(false)}>Học thử miễn phí</ScrollLink>
      </div>
      <ScrollLink href="#contact" className="side-tab">Nhận tư vấn →</ScrollLink>
    </>
  )
}
