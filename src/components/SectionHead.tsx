export default function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="section-head reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
    </header>
  )
}
