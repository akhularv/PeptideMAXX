import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMetrics } from '@/hooks/useMetrics'
import { useUserStore } from '@/store/useUserStore'
import { BioSpecimen } from '@/components/layout/BioSpecimen'

function distinctDates(logs: { date: string }[]) {
  return new Set(logs.map((log) => log.date)).size
}

function mostUsed(logs: { compound: string }[]) {
  if (!logs.length) return '—'
  const counts: Record<string, number> = {}
  for (const log of logs) counts[log.compound] = (counts[log.compound] ?? 0) + 1
  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0]
}

function currentStreak(logs: { date: string }[]) {
  const dateSet = new Set(logs.map((log) => log.date))
  let streak = 0
  const cursor = new Date()

  const keyFor = (date: Date) => date.toISOString().slice(0, 10)

  if (!dateSet.has(keyFor(cursor))) cursor.setDate(cursor.getDate() - 1)

  while (dateSet.has(keyFor(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function buildChartData(logs: { date: string }[]) {
  const result: { date: string; count: number }[] = []
  for (let index = 29; index >= 0; index -= 1) {
    const day = new Date()
    day.setDate(day.getDate() - index)
    const key = day.toISOString().slice(0, 10)
    result.push({
      date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: logs.filter((log) => log.date === key).length,
    })
  }
  return result
}

function InstrumentMetric({
  label,
  value,
  note,
}: {
  label: string
  value: string | number
  note?: string
}) {
  return (
    <div className="atlas-readout">
      <div className="atlas-label" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div className="atlas-readout__value" style={{ fontSize: 34, marginBottom: note ? 8 : 0 }}>
        {value}
      </div>
      {note ? <p className="atlas-caption">{note}</p> : null}
    </div>
  )
}

function MuscleFigure({ variant }: { variant: 'shoulders' | 'back' }) {
  return (
    <svg viewBox="0 0 120 220" style={{ width: 84, height: 160 }}>
      <g stroke="rgba(175, 192, 226, 0.9)" strokeWidth="1.7" fill="none" strokeLinecap="round">
        <circle cx="60" cy="18" r="10" fill="rgba(231, 238, 255, 0.45)" />
        <path d="M45 42 C50 34, 70 34, 75 42" />
        <path d="M40 48 C46 40, 74 40, 80 48" />
        <path d="M48 48 L45 82 L53 122 L49 190" />
        <path d="M72 48 L75 82 L67 122 L71 190" />
        <path d="M60 50 L60 102" />
        <path d="M48 82 C54 88, 66 88, 72 82" />
        <path d="M45 82 L40 112 L44 148" />
        <path d="M75 82 L80 112 L76 148" />
        <path d="M53 122 L48 156 L51 210" />
        <path d="M67 122 L72 156 L69 210" />
        <path d="M48 210 L42 216" />
        <path d="M72 210 L78 216" />
        <path d="M42 112 L36 144" />
        <path d="M78 112 L84 144" />
      </g>

      {variant === 'shoulders' ? (
        <g fill="rgba(235, 107, 107, 0.78)" stroke="rgba(219, 91, 91, 0.92)" strokeWidth="1">
          <path d="M40 46 C46 38, 54 40, 56 48 C52 58, 45 60, 39 54 Z" />
          <path d="M80 46 C74 38, 66 40, 64 48 C68 58, 75 60, 81 54 Z" />
          <path d="M48 50 C53 46, 57 46, 60 52 C57 62, 52 64, 47 58 Z" />
          <path d="M72 50 C67 46, 63 46, 60 52 C63 62, 68 64, 73 58 Z" />
        </g>
      ) : (
        <g fill="rgba(235, 107, 107, 0.78)" stroke="rgba(219, 91, 91, 0.92)" strokeWidth="1">
          <path d="M43 48 C50 42, 56 44, 58 54 L55 68 C48 67, 43 61, 40 54 Z" />
          <path d="M77 48 C70 42, 64 44, 62 54 L65 68 C72 67, 77 61, 80 54 Z" />
          <path d="M48 70 C52 64, 68 64, 72 70 L74 92 C68 102, 52 102, 46 92 Z" />
          <path d="M54 92 L48 126 L58 130 L60 98 Z" />
          <path d="M66 92 L72 126 L62 130 L60 98 Z" />
        </g>
      )}
    </svg>
  )
}

function MuscleCard({
  label,
  variant,
  active,
}: {
  label: string
  variant: 'shoulders' | 'back'
  active?: boolean
}) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: active ? '2px solid rgba(91, 200, 226, 0.95)' : '1px solid rgba(202, 212, 230, 0.95)',
        background: 'linear-gradient(180deg, rgba(248,250,255,0.96), rgba(238,242,251,0.92))',
        boxShadow: active ? '0 10px 24px rgba(92, 193, 217, 0.16)' : 'none',
        padding: '14px 12px 12px',
        display: 'grid',
        justifyItems: 'center',
        gap: 8,
      }}
    >
      <MuscleFigure variant={variant} />
      <div
        style={{
          color: '#1e2730',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function BionicBodyPanel() {
  return (
    <div className="atlas-panel atlas-panel--soft" style={{ padding: 22, height: '100%' }}>
      <div className="atlas-kicker" style={{ marginBottom: 12 }}>
        Muscle composition field
      </div>
      <div
        style={{
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.12)',
          background:
            'linear-gradient(180deg, rgba(247, 242, 239, 0.98), rgba(233, 229, 227, 0.94))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
          padding: 18,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 190px) minmax(0, 1fr)',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: '#11161c',
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '-0.03em',
                marginBottom: 6,
              }}
            >
              Muscles workload
            </div>
            <div
              style={{
                color: 'rgba(32, 43, 57, 0.68)',
                fontSize: 11,
                lineHeight: 1.45,
                marginBottom: 14,
              }}
            >
              Select muscle type you want to make strong
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              {['Shoulders', 'Back', 'Target mapping'].map((label) => (
                <span
                  key={label}
                  style={{
                    borderRadius: 999,
                    border: '1px solid rgba(32,43,57,0.12)',
                    color: '#27323d',
                    padding: '8px 11px',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: 'rgba(255,255,255,0.42)',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div style={{ color: '#324150', fontSize: 14, lineHeight: 1.6 }}>
              A web-native interpretation of the same reference language, scaled for the
              atlas rather than a phone mockup.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))', gap: 12 }}>
            <MuscleCard label="Shoulders" variant="shoulders" active />
            <MuscleCard label="Back" variant="back" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricsContextPanel({ topCompound }: { topCompound: string }) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="atlas-readout">
        <div className="atlas-kicker" style={{ marginBottom: 10 }}>
          Atlas note
        </div>
        <p className="atlas-caption" style={{ maxWidth: '34ch' }}>
          The vitals surface pairs body signal, anatomy focus, and protocol movement in
          one continuous reading environment instead of isolated KPI cards.
        </p>
      </div>

      <div className="atlas-readout">
        <div className="atlas-label" style={{ marginBottom: 8 }}>
          Most used compound
        </div>
        <div className="atlas-readout__value" style={{ fontSize: 28, marginBottom: 8 }}>
          {topCompound}
        </div>
        <p className="atlas-caption" style={{ maxWidth: '34ch' }}>
          Based on the current protocol log. Empty states stay readable instead of collapsing into blank charts.
        </p>
      </div>
    </div>
  )
}

export function Metrics() {
  const navigate = useNavigate()
  const { metrics, saveMetrics, loading: metricsLoading } = useMetrics()
  const { logs } = useUserStore()

  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bloodwork, setBloodwork] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!metrics) return
    setWeight(metrics.weight_kg != null ? String(metrics.weight_kg) : '')
    setHeight(metrics.height_cm != null ? String(metrics.height_cm) : '')
    setBloodwork(metrics.bloodwork_notes ?? '')
  }, [metrics])

  const bmi = useMemo(() => {
    const currentWeight = parseFloat(weight)
    const currentHeight = parseFloat(height) / 100
    if (!currentWeight || !currentHeight) return null
    return (currentWeight / (currentHeight * currentHeight)).toFixed(1)
  }, [height, weight])

  const chartData = useMemo(() => buildChartData(logs), [logs])
  const distinctCompounds = new Set(logs.map((log) => log.compound)).size
  const totalEntries = logs.length
  const daysTracked = distinctDates(logs)
  const topCompound = mostUsed(logs)
  const streak = currentStreak(logs)
  const recentActive = logs.some((log) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return new Date(log.date) >= cutoff
  })

  const bmiValue = bmi ? Number(bmi) : 0
  const dialProgress = Math.max(0, Math.min(bmiValue / 34, 1))

  return (
    <div className="atlas-shell">
      <div className="atlas-page-intro">
        <div className="atlas-kicker" style={{ marginBottom: 10 }}>
          Vital instruments
        </div>
        <h1 className="atlas-page-title atlas-page-title--wide">
          Biometrics in an interface built for reading change over time.
        </h1>
        <p className="atlas-copy atlas-page-lead">
          The metrics surface behaves like a compact diagnostic panel: one focal BMI
          instrument, one biometric rack, and one protocol-context rail.
        </p>
      </div>

      <div className="atlas-layout-metrics">
        <section className="atlas-panel atlas-panel--soft" style={{ padding: 22 }}>
          <div className="atlas-kicker" style={{ marginBottom: 12 }}>
            Biometric rack
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div className="atlas-label" style={{ marginBottom: 8 }}>
                Weight (kg)
              </div>
              <input
                className="atlas-input"
                type="number"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="78.5"
              />
            </div>

            <div>
              <div className="atlas-label" style={{ marginBottom: 8 }}>
                Height (cm)
              </div>
              <input
                className="atlas-input"
                type="number"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="175"
              />
            </div>

            <div>
              <div className="atlas-label" style={{ marginBottom: 8 }}>
                Bloodwork notes
              </div>
              <textarea
                className="atlas-textarea"
                rows={6}
                value={bloodwork}
                onChange={(event) => setBloodwork(event.target.value)}
                placeholder="Paste labs, observations, markers, or questions here..."
                style={{ resize: 'none' }}
              />
            </div>

            <button
              className="atlas-button-primary"
              onClick={async () => {
                setSaving(true)
                await saveMetrics({
                  weight_kg: parseFloat(weight) || undefined,
                  height_cm: parseFloat(height) || undefined,
                  bloodwork_notes: bloodwork || undefined,
                })
                setSaving(false)
              }}
              disabled={saving || metricsLoading}
              style={{ width: '100%' }}
            >
              {saving ? 'Saving biometrics' : 'Save biometrics'}
            </button>
          </div>
        </section>

        <section className="atlas-panel" style={{ padding: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
              alignItems: 'start',
              marginBottom: 24,
            }}
          >
            <div className="atlas-panel atlas-panel--soft" style={{ padding: 22 }}>
              <div className="atlas-kicker" style={{ marginBottom: 12 }}>
                BMI instrument
              </div>

              <div
                style={{
                  width: 220,
                  height: 220,
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: `conic-gradient(var(--accent) 0deg ${dialProgress * 320}deg, rgba(147,246,216,0.08) ${dialProgress * 320}deg 320deg, rgba(255,255,255,0.04) 320deg 360deg)`,
                  boxShadow: 'inset 0 0 36px rgba(0,0,0,0.22)',
                }}
              >
                <div
                  style={{
                    width: 154,
                    height: 154,
                    borderRadius: '50%',
                    background: 'rgba(6,11,17,0.95)',
                    border: '1px solid rgba(147,246,216,0.12)',
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div className="atlas-readout__value" style={{ fontSize: 42, marginBottom: 8 }}>
                      {bmi ?? '—'}
                    </div>
                    <div className="atlas-label">Body mass index</div>
                  </div>
                </div>
              </div>

              <p className="atlas-caption">
                A quick instrument view for context, not diagnosis. Send the underlying
                biometrics to Dr. Voss when you want interpretation against your protocol.
              </p>
            </div>

            <MetricsContextPanel topCompound={topCompound} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <BionicBodyPanel />
          </div>

          <div className="atlas-panel atlas-panel--soft" style={{ padding: 22 }}>
            <div className="atlas-kicker" style={{ marginBottom: 14 }}>
              30 day protocol signal
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -22 }}>
                <XAxis
                  dataKey="date"
                  stroke="rgba(182,197,195,0.25)"
                  tick={{ fill: '#91a29f', fontSize: 11, fontFamily: 'var(--ui)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={9}
                />
                <YAxis
                  stroke="rgba(182,197,195,0.25)"
                  tick={{ fill: '#91a29f', fontSize: 11, fontFamily: 'var(--ui)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(6,11,17,0.96)',
                    border: '1px solid rgba(147,246,216,0.12)',
                    borderRadius: 16,
                    color: '#eff5ef',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--accent)"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4, fill: '#93f6d8', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="atlas-panel atlas-panel--soft atlas-sticky-rail" style={{ padding: 22 }}>
          <BioSpecimen size="sm" label="Vitals field" style={{ margin: '0 auto 18px' }} />

          <div className="atlas-grid-strip" style={{ marginBottom: 18 }}>
            <InstrumentMetric label="Compounds" value={distinctCompounds} />
            <InstrumentMetric label="Entries" value={totalEntries} />
            <InstrumentMetric label="Days tracked" value={daysTracked} />
            <InstrumentMetric label="Streak" value={streak} />
            <InstrumentMetric label="Active last 7d" value={recentActive ? 'Yes' : 'No'} />
          </div>

          <button
            className="atlas-button-secondary"
            onClick={() => {
              const message =
                `Review my current biometrics and protocol context. Weight: ${weight || 'unknown'} kg. ` +
                `Height: ${height || 'unknown'} cm. BMI: ${bmi ?? 'unknown'}. ` +
                `Tracked entries: ${totalEntries}. Days tracked: ${daysTracked}. ` +
                (bloodwork ? `Bloodwork notes: ${bloodwork}` : '')
              sessionStorage.setItem('drVossInitialMessage', message)
              navigate('/app/chat')
            }}
            style={{ width: '100%' }}
          >
            Send to Dr. Voss
          </button>
        </aside>
      </div>
    </div>
  )
}
