import { useEffect, type RefObject } from 'react'

/** Gắn canvas vừa khít phần tử cha (theo devicePixelRatio) và chạy vòng vẽ requestAnimationFrame. */
export function useCanvasLoop(
  ref: RefObject<HTMLCanvasElement | null>,
  setup: (ctx: CanvasRenderingContext2D, size: { w: number; h: number }) => (t: number, size: { w: number; h: number }) => void,
  opts: { fixed?: boolean } = {},
) {
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = { w: 0, h: 0 }
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const box = opts.fixed ? { width: window.innerWidth, height: window.innerHeight } : { width: canvas.parentElement!.clientWidth, height: canvas.parentElement!.clientHeight }
      size.w = box.width
      size.h = box.height
      canvas.width = Math.round(size.w * dpr)
      canvas.height = Math.round(size.h * dpr)
      canvas.style.width = size.w + 'px'
      canvas.style.height = size.h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const draw = setup(ctx, size)
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(opts.fixed ? document.body : canvas)
    const loop = (t: number) => {
      if (visible) draw(t / 1000, size)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
