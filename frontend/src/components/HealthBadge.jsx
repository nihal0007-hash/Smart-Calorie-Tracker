export default function HealthBadge({ score, isSuitable, size = 'md' }) {
  const isGood = score >= 7
  const isOk = score >= 4 && score < 7
  const color = isGood ? 'var(--success)' : isOk ? 'var(--warning)' : 'var(--danger)'
  const bg = isGood ? 'rgba(34,197,94,0.1)' : isOk ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'
  const label = isGood ? 'Excellent' : isOk ? 'Moderate' : 'Poor'
  const emoji = isGood ? '✅' : isOk ? '⚠️' : '❌'

  const padding = size === 'sm' ? '4px 10px' : '6px 14px'
  const fontSize = size === 'sm' ? '0.75rem' : '0.875rem'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding, borderRadius: 100, fontSize, fontWeight: 600,
      color, background: bg, border: `1px solid ${color}30`,
    }}>
      {emoji} {label} ({score}/10)
      {!isSuitable && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>• Not Suitable</span>}
    </span>
  )
}
