import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { useLenis } from 'lenis/react'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; onNavigate?: () => void }

/** Liên kết neo cuộn mượt bằng Lenis. */
export default function ScrollLink({ href, onNavigate, onClick, ...rest }: Props) {
  const lenis = useLenis()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (!href.startsWith('#')) return
    e.preventDefault()
    onNavigate?.()
    const target = href === '#hero' ? 0 : href
    if (lenis) lenis.scrollTo(target, { duration: 1.6 })
    else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }
  return <a href={href} onClick={handle} {...rest} />
}
