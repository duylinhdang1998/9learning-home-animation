export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4a5ff" />
          <stop offset="1" stopColor="#7b3cff" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#logo-g)" />
      <circle cx="19" cy="16" r="6.2" fill="none" stroke="#0b0614" strokeWidth="3.4" />
      <path d="M25.2 16v6.5c0 5-3.3 8.3-8.6 8.3" fill="none" stroke="#0b0614" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  )
}
