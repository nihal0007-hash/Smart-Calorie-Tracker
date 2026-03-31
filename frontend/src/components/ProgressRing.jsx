export default function ProgressRing({ value, max, size = 140, stroke = 12, color = '#00d4aa', label, sublabel }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min((value / max) * 100, 100)
  const offset = circumference - (pct / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size > 100 ? '1.6rem' : '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Math.round(value)}
          </span>
          {sublabel && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sublabel}</span>}
        </div>
      </div>
      {label && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>}
    </div>
  )
}
