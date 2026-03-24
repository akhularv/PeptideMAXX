import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { compounds } from '@/lib/compounds'
import type { Compound } from '@/types/compound'
import { BioSpecimen } from '@/components/layout/BioSpecimen'

type CategoryFilter = 'all' | 'peptide' | 'nootropic' | 'compound'
type EvidenceFilter = 'all' | 'clinical' | 'preclinical' | 'anecdotal'

const EVIDENCE_COLORS: Record<Compound['evidenceTier'], string> = {
  clinical: 'var(--accent)',
  preclinical: 'var(--accent-warm)',
  anecdotal: 'var(--accent-cool)',
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={active ? 'atlas-chip atlas-chip--active' : 'atlas-chip'}
      onClick={onClick}
      style={{ justifyContent: 'center' }}
    >
      {label}
    </button>
  )
}

function CompoundStrip({
  compound,
  active,
  onClick,
}: {
  compound: Compound
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: active ? '20px 0 18px' : '18px 0',
        borderBottom: '1px solid rgba(147,246,216,0.08)',
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '84px minmax(0, 1fr) minmax(124px, 160px)',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <div className="atlas-label" style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}>
          {compound.id.toUpperCase()}
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--display)',
                fontSize: active ? 24 : 21,
                fontWeight: 600,
                color: active ? 'var(--text)' : 'var(--text-dim)',
              }}
            >
              {compound.name}
            </span>
            <span className="atlas-chip">{compound.category}</span>
          </div>
          <p className="atlas-caption" style={{ maxWidth: '58ch' }}>{compound.summary}</p>
        </div>
        <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
          <span
            className="atlas-chip"
            style={{
              borderColor: `${EVIDENCE_COLORS[compound.evidenceTier]}40`,
              color: EVIDENCE_COLORS[compound.evidenceTier],
            }}
          >
            {compound.evidenceTier}
          </span>
          <span className="atlas-label">{compound.tags.slice(0, 2).join(' • ')}</span>
        </div>
      </div>
    </button>
  )
}

export function Library() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [evidence, setEvidence] = useState<EvidenceFilter>('all')
  const [selectedId, setSelectedId] = useState<string>(compounds[0]?.id ?? '')

  const filtered = useMemo(() => {
    return compounds.filter((compound) => {
      if (category !== 'all' && compound.category !== category) return false
      if (evidence !== 'all' && compound.evidenceTier !== evidence) return false
      if (!search.trim()) return true
      const query = search.trim().toLowerCase()
      return (
        compound.name.toLowerCase().includes(query) ||
        compound.aliases?.some((alias) => alias.toLowerCase().includes(query)) ||
        compound.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        compound.summary.toLowerCase().includes(query) ||
        compound.mechanism.toLowerCase().includes(query)
      )
    })
  }, [category, evidence, search])

  const selectedCompound =
    filtered.find((compound) => compound.id === selectedId) ?? filtered[0] ?? compounds[0]

  const handleAskVoss = (compound: Compound) => {
    sessionStorage.setItem(
      'drVossInitialMessage',
      `Review ${compound.name} for mechanism, evidence strength, safety concerns, and where it fits in a protocol.`
    )
    navigate('/app/chat')
  }

  return (
    <div className="atlas-shell">
      <div className="atlas-page-intro">
        <div className="atlas-kicker" style={{ marginBottom: 12 }}>
          Compound atlas
        </div>
        <h1 className="atlas-page-title atlas-page-title--wide">
          Browse compounds as layered dossiers.
        </h1>
        <p className="atlas-copy atlas-page-lead">
          Search broadly, then let the right rail hold mechanism, safety, and protocol
          context while the list stays dense and readable.
        </p>
      </div>

      <div className="atlas-layout-library">
        <aside className="atlas-panel atlas-panel--soft atlas-sticky-rail" style={{ padding: 22 }}>
          <div className="atlas-kicker" style={{ marginBottom: 18 }}>
            Filter rail
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <label className="atlas-label">Search</label>
            <input
              className="atlas-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search compounds, mechanisms, or tags"
            />
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            <div className="atlas-label">Category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(['all', 'peptide', 'nootropic', 'compound'] as CategoryFilter[]).map((option) => (
                <FilterChip
                  key={option}
                  active={category === option}
                  label={option}
                  onClick={() => setCategory(option)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 22 }}>
            <div className="atlas-label">Evidence</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(['all', 'clinical', 'preclinical', 'anecdotal'] as EvidenceFilter[]).map((option) => (
                <FilterChip
                  key={option}
                  active={evidence === option}
                  label={option}
                  onClick={() => setEvidence(option)}
                />
              ))}
            </div>
          </div>

          <div className="atlas-divider" style={{ marginBottom: 18 }} />

          <div className="atlas-label" style={{ marginBottom: 10 }}>
            Atlas notes
          </div>
          <div className="atlas-grid-strip">
            <div className="atlas-readout">
              <div className="atlas-readout__value" style={{ fontSize: 34, marginBottom: 8 }}>
                {filtered.length}
              </div>
              <div className="atlas-label">Visible dossiers</div>
            </div>
            <p className="atlas-caption" style={{ maxWidth: '30ch' }}>
              Rows stay broad and scan-friendly. Details emerge in context rather than
              interrupting the browsing flow.
            </p>
          </div>
        </aside>

        <section className="atlas-panel" style={{ padding: '12px 28px 18px' }}>
          {filtered.map((compound) => (
            <div key={compound.id}>
              <CompoundStrip
                compound={compound}
                active={selectedCompound?.id === compound.id}
                onClick={() => setSelectedId(compound.id)}
              />
              <AnimatePresence initial={false}>
                {selectedCompound?.id === compound.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        padding: '0 0 20px 84px',
                        display: 'grid',
                        gap: 16,
                      }}
                    >
                      <p className="atlas-copy" style={{ fontSize: 15, maxWidth: '68ch' }}>{compound.mechanism}</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {(compound.commonDoses ?? []).slice(0, 2).map((dose) => (
                          <span key={dose} className="atlas-chip">
                            {dose}
                          </span>
                        ))}
                        {(compound.routes ?? []).slice(0, 2).map((route) => (
                          <span key={route} className="atlas-chip">
                            {route}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </section>

        <aside className="atlas-panel atlas-panel--soft atlas-sticky-rail" style={{ padding: 22 }}>
          {selectedCompound ? (
            <>
              <BioSpecimen
                size="sm"
                label={selectedCompound.evidenceTier}
                accent={EVIDENCE_COLORS[selectedCompound.evidenceTier]}
                style={{ margin: '4px auto 18px' }}
              />

              <div className="atlas-kicker" style={{ marginBottom: 12 }}>
                Active dossier
              </div>
              <h2 style={{ fontSize: 34, marginBottom: 8 }}>{selectedCompound.name}</h2>
              <p className="atlas-caption" style={{ marginBottom: 16, maxWidth: '34ch' }}>
                {selectedCompound.summary}
              </p>

              <div className="atlas-grid-strip" style={{ marginBottom: 18 }}>
                <div className="atlas-readout">
                  <div className="atlas-label" style={{ marginBottom: 8 }}>
                    Primary effects
                  </div>
                  <p className="atlas-caption">{selectedCompound.effects.slice(0, 3).join(' • ')}</p>
                </div>
                <div className="atlas-readout">
                  <div className="atlas-label" style={{ marginBottom: 8 }}>
                    Risk note
                  </div>
                  <p className="atlas-caption">
                    {selectedCompound.dangers[0] ?? 'No major danger field stored in current dataset.'}
                  </p>
                </div>
              </div>

              <button
                className="atlas-button-primary"
                onClick={() => handleAskVoss(selectedCompound)}
                style={{ width: '100%' }}
              >
                Ask Dr. Voss
              </button>
            </>
          ) : (
            <p className="atlas-caption">No compound matches the current filters.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
