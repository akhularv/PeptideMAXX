import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { compounds } from '@/lib/compounds'
import { useLog } from '@/hooks/useLog'

interface FormState {
  compound: string
  dose: string
  route: string
  date: string
  note: string
  mood: number | null
}

const ROUTES = ['SubQ', 'IM', 'IV', 'Oral', 'Intranasal', 'Topical', 'Other']

function getAccentColor(name: string) {
  return compounds.find((compound) => compound.name === name)?.accentColor ?? 'var(--accent-cool)'
}

function blankForm(): FormState {
  return {
    compound: '',
    dose: '',
    route: 'SubQ',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    mood: null,
  }
}

function formatDay(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function LogFormModal({
  onClose,
  onSubmit,
  submitting,
}: {
  onClose: () => void
  onSubmit: (form: FormState) => Promise<void>
  submitting: boolean
}) {
  const [form, setForm] = useState<FormState>(blankForm())

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'rgba(77, 49, 35, 0.36)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(event) => event.stopPropagation()}
        onSubmit={async (event) => {
          event.preventDefault()
          if (!form.compound.trim()) return
          await onSubmit(form)
          onClose()
        }}
        className="atlas-panel"
        style={{
          width: 'min(760px, 100%)',
          padding: '26px clamp(18px, 4vw, 30px)',
          display: 'grid',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="atlas-kicker" style={{ marginBottom: 10 }}>
              New protocol entry
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 8 }}>
              Capture route, dose, and observations.
            </h2>
          </div>
          <button type="button" className="atlas-button-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          <div>
            <div className="atlas-label" style={{ marginBottom: 8 }}>
              Compound
            </div>
            <input
              className="atlas-input"
              list="protocol-compound-options"
              value={form.compound}
              onChange={(event) => update('compound', event.target.value)}
              placeholder="BPC-157"
            />
            <datalist id="protocol-compound-options">
              {compounds.map((compound) => (
                <option key={compound.id} value={compound.name} />
              ))}
            </datalist>
          </div>

          <div>
            <div className="atlas-label" style={{ marginBottom: 8 }}>
              Dose
            </div>
            <input
              className="atlas-input"
              value={form.dose}
              onChange={(event) => update('dose', event.target.value)}
              placeholder="500 mcg"
            />
          </div>

          <div>
            <div className="atlas-label" style={{ marginBottom: 8 }}>
              Route
            </div>
            <select
              className="atlas-select"
              value={form.route}
              onChange={(event) => update('route', event.target.value)}
            >
              {ROUTES.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="atlas-label" style={{ marginBottom: 8 }}>
              Date
            </div>
            <input
              className="atlas-input"
              type="date"
              value={form.date}
              onChange={(event) => update('date', event.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="atlas-label" style={{ marginBottom: 8 }}>
            Mood
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={form.mood === value ? 'atlas-chip atlas-chip--active' : 'atlas-chip'}
                onClick={() => update('mood', value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="atlas-label" style={{ marginBottom: 8 }}>
            Notes
          </div>
          <textarea
            className="atlas-textarea"
            rows={5}
            value={form.note}
            onChange={(event) => update('note', event.target.value)}
            placeholder="Effects, sleep, appetite, recovery, pain, blood pressure, or any clinically relevant context."
            style={{ resize: 'none' }}
          />
        </div>

        <button type="submit" className="atlas-button-primary" disabled={submitting}>
          {submitting ? 'Saving entry' : 'Save entry'}
        </button>
      </motion.form>
    </motion.div>
  )
}

export function Log() {
  const { entries, addEntry, deleteEntry, loading } = useLog()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, typeof entries>()
    for (const entry of entries) {
      const current = groups.get(entry.date) ?? []
      current.push(entry)
      groups.set(entry.date, current)
    }
    return Array.from(groups.entries()).sort((left, right) => (left[0] > right[0] ? -1 : 1))
  }, [entries])

  const handleSubmit = async (form: FormState) => {
    setSaving(true)
    await addEntry({
      compound: form.compound,
      dose: form.dose || undefined,
      route: form.route || undefined,
      date: form.date,
      note: form.note || undefined,
      mood: form.mood ?? undefined,
      tags: [],
    })
    setSaving(false)
  }

  return (
    <div className="atlas-shell">
      <div className="atlas-page-intro">
        <div className="atlas-kicker" style={{ marginBottom: 12 }}>
          Protocol memory
        </div>
        <h1 className="atlas-page-title atlas-page-title--wide">
          A log surface that reads like a disciplined timeline, not a form dump.
        </h1>
        <p className="atlas-copy atlas-page-lead">
          Capture protocol events with enough structure to stay useful later. Chronology,
          compound identity, route, dose, and observations remain visible without turning the
          experience into a spreadsheet.
        </p>
      </div>

      <div className="atlas-layout-log">
        <section className="atlas-panel" style={{ padding: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <div className="atlas-kicker" style={{ marginBottom: 10 }}>
                Timeline
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 8 }}>Protocol chronology</h2>
            </div>
            <button className="atlas-button-primary" onClick={() => setOpen(true)}>
              <Plus size={16} />
              Add entry
            </button>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            {loading ? (
              <div className="atlas-readout">
                <p className="atlas-caption">Loading protocol history...</p>
              </div>
            ) : groupedEntries.length === 0 ? (
              <div className="atlas-readout">
                <div className="atlas-kicker" style={{ marginBottom: 8 }}>
                  No entries yet
                </div>
                <p className="atlas-caption" style={{ maxWidth: '34ch' }}>
                  The atlas is ready. Add a first entry to activate the full chronology view.
                </p>
              </div>
            ) : (
              groupedEntries.map(([date, dayEntries], groupIndex) => (
                <div
                  key={date}
                  className="atlas-panel atlas-panel--soft"
                  style={{
                    padding: '18px 18px 20px',
                    borderLeft: `3px solid ${groupIndex % 2 === 0 ? 'var(--accent)' : 'var(--accent-cool)'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'end',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div className="atlas-kicker" style={{ marginBottom: 8 }}>
                        Protocol day
                      </div>
                      <h3 style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}>{formatDay(date)}</h3>
                    </div>
                    <span className="atlas-chip">{dayEntries.length} entries</span>
                  </div>

                  <div className="atlas-grid-strip">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="atlas-readout"
                        style={{ borderLeft: `2px solid ${getAccentColor(entry.compound)}` }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            flexWrap: 'wrap',
                            marginBottom: 10,
                          }}
                        >
                      <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                            <strong style={{ fontSize: 18, color: 'var(--text)' }}>{entry.compound}</strong>
                            {entry.dose ? <span className="atlas-chip">{entry.dose}</span> : null}
                            {entry.route ? <span className="atlas-chip">{entry.route}</span> : null}
                            {entry.mood ? <span className="atlas-chip">Mood {entry.mood}</span> : null}
                          </div>
                          <button
                            className="atlas-button-secondary"
                            onClick={() => void deleteEntry(entry.id)}
                            style={{ paddingInline: 14 }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {entry.note ? <p className="atlas-caption" style={{ maxWidth: '66ch' }}>{entry.note}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="atlas-panel atlas-panel--soft atlas-sticky-rail" style={{ padding: 22 }}>
          {/* "Protocol field" header with teal dot — replaces BioSpecimen */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 10px rgba(176,84,43,0.3)',
                flexShrink: 0,
              }}
            />
            <span className="atlas-label">Protocol field</span>
          </div>

          <div className="atlas-grid-strip">
            <MetricTile label="Entries" value={String(entries.length)} />
            <MetricTile label="Tracked days" value={String(groupedEntries.length)} />
            <MetricTile
              label="Most recent day"
              value={groupedEntries.length ? formatDay(groupedEntries[0][0]) : 'None'}
            />
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {open ? <LogFormModal onClose={() => setOpen(false)} onSubmit={handleSubmit} submitting={saving} /> : null}
      </AnimatePresence>
    </div>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="atlas-readout">
      <div className="atlas-label" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div className="atlas-readout__value" style={{ fontSize: 28 }}>
        {value}
      </div>
    </div>
  )
}
