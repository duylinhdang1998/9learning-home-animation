import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { isTouch } from '../lib/useCanvas'

const LABELS = ['IGCSE', 'Kế toán', 'Kiểm toán', '9invest', 'NEU', 'Economics', 'Học thử', 'Live', 'Chứng chỉ', 'Toán', 'Tài chính', '1 kèm 1', 'Đề thi thử', 'Business', 'Lộ trình', 'A*']
const STYLES = ['b-violet', 'b-white', 'b-outline', 'b-deep', 'b-lilac']

/** Khối rơi có vật lý (Matter.js) ở footer: rơi khi footer vào màn hình, kéo thả được bằng chuột. */
export default function PhysicsBlocks() {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = box.current!
    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body } = Matter
    const engine = Engine.create({ gravity: { x: 0, y: 1.1 } })
    const runner = Runner.create()
    let walls: Matter.Body[] = []
    const items: { body: Matter.Body; node: HTMLElement; w: number; h: number }[] = []
    let started = false
    let raf = 0
    const timers: number[] = []

    const buildWalls = () => {
      Composite.remove(engine.world, walls)
      const w = el.clientWidth, h = el.clientHeight
      walls = [
        Bodies.rectangle(w / 2, h + 50, w * 3, 100, { isStatic: true }),
        Bodies.rectangle(-50, h / 2, 100, h * 4, { isStatic: true }),
        Bodies.rectangle(w + 50, h / 2, 100, h * 4, { isStatic: true }),
      ]
      Composite.add(engine.world, walls)
    }

    const drop = () => {
      const w = el.clientWidth
      const small = w < 700
      const labels = small ? LABELS.slice(0, 11) : LABELS
      labels.forEach((label, i) => {
        timers.push(window.setTimeout(() => {
          const node = document.createElement('div')
          node.className = `pblock ${STYLES[i % STYLES.length]}${i % 4 === 3 ? ' round' : ''}`
          node.textContent = label
          el.appendChild(node)
          const bw = node.offsetWidth, bh = node.offsetHeight
          const x = bw / 2 + Math.random() * (w - bw)
          const body = node.classList.contains('round')
            ? Bodies.circle(x, -bh - 20, bw / 2, { restitution: 0.5, friction: 0.3, density: 0.002 })
            : Bodies.rectangle(x, -bh - 20, bw, bh, { chamfer: { radius: bh / 2 }, restitution: 0.4, friction: 0.4, density: 0.002 })
          Body.setAngle(body, (Math.random() - 0.5) * 0.8)
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08)
          Composite.add(engine.world, body)
          items.push({ body, node, w: bw, h: bh })
        }, i * 140))
      })
    }

    const render = () => {
      for (const it of items) {
        const { x, y } = it.body.position
        it.node.style.transform = `translate(${x - it.w / 2}px, ${y - it.h / 2}px) rotate(${it.body.angle}rad)`
      }
      raf = requestAnimationFrame(render)
    }

    buildWalls()
    if (!isTouch()) {
      const mouse = Mouse.create(el)
      // trả lại cuộn trang cho Lenis: bỏ trình nghe wheel mà Matter gắn vào
      const mw = (mouse as unknown as { mousewheel: EventListener }).mousewheel
      el.removeEventListener('mousewheel', mw)
      el.removeEventListener('DOMMouseScroll', mw)
      el.removeEventListener('wheel', mw)
      const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } })
      Composite.add(engine.world, mc)
      Events.on(mc, 'startdrag', () => el.classList.add('dragging'))
      Events.on(mc, 'enddrag', () => el.classList.remove('dragging'))
    }

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true
        Runner.run(runner, engine)
        render()
        drop()
      }
    }, { threshold: 0.25 })
    io.observe(el)

    const onResize = () => buildWalls()
    window.addEventListener('resize', onResize)
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
      cancelAnimationFrame(raf)
      Runner.stop(runner)
      Engine.clear(engine)
      items.forEach((i) => i.node.remove())
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <div className="physics" ref={box} aria-hidden="true" />
}
