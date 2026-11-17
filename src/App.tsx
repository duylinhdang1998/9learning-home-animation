import { useEffect, useRef } from 'react'
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import { gsap, ScrollTrigger } from './lib/gsap'
import CursorCanvas from './components/CursorCanvas'
import Header from './components/Header'
import StatWidget from './components/StatWidget'
import Hero from './components/Hero'
import CardStack from './components/CardStack'
import Marquee from './components/Marquee'
import Manifesto from './components/Manifesto'
import Features from './components/Features'
import Platform from './components/Platform'
import Process from './components/Process'
import Pricing from './components/Pricing'
import Faq from './components/Faq'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

/** Báo cho ScrollTrigger mỗi khi Lenis cuộn. */
function ScrollSync() {
  useLenis(() => ScrollTrigger.update())
  return null
}

export default function App() {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    // Lenis chạy trên ticker của GSAP để hiệu ứng theo cuộn khớp từng khung hình.
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    if (import.meta.env.DEV) Object.assign(window, { __lenis: () => lenisRef.current?.lenis })
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => {
      gsap.ticker.remove(update)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9 }}>
      <ScrollSync />
      <CursorCanvas />
      <Header />
      <StatWidget />
      <main>
        <Hero />
        {/* khối tối được ghim, nền trắng của Platform trồi lên che dần */}
        <div className="cover-wrap">
          <Manifesto />
          <Platform />
        </div>
        <Marquee />
        <Process />
        <CardStack />
        <Features />
        <Pricing />
        <Faq />
        <ContactForm />
      </main>
      <Footer />
    </ReactLenis>
  )
}
