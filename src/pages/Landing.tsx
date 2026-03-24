import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { MolecularBackground } from '@/components/landing/MolecularBackground'
import { compounds } from '@/lib/compounds'
import { BioSpecimen } from '@/components/layout/BioSpecimen'

const CHAPTERS = [
  {
    id: 'observe',
    label: 'Observe',
    title: 'Read compounds like specimens, not products.',
    body:
      'Every record is framed as a living dossier: evidence tier, mechanism, dose patterns, and conflict profile stay visible while the interface breathes around them.',
  },
  {
    id: 'consult',
    label: 'Consult',
    title: 'Keep the expert and the evidence in the same room.',
    body:
      'Dr. Voss sits beside the data, not above it. Context rails, recent stack activity, and safety notes remain close enough to shape the decision in real time.',
  },
  {
    id: 'adapt',
    label: 'Adapt',
    title: 'Move from logging to pattern recognition.',
    body:
      'Protocols, biometrics, and response notes link together so the product feels more like a lab notebook with intelligence than a dashboard with widgets.',
  },
]

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="atlas-kicker" style={{ marginBottom: 16 }}>
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: 'clamp(34px, 4vw, 62px)',
          maxWidth: 760,
          marginBottom: 18,
          lineHeight: 0.98,
        }}
      >
        {title}
      </h2>
      <p className="atlas-copy" style={{ maxWidth: 640 }}>
        {copy}
      </p>
    </motion.div>
  )
}

export function Landing() {
  const compoundPreview = useMemo(() => compounds.slice(0, 4), [])

  return (
    <div className="atlas-page">
      <section
        className="atlas-shell"
        style={{
          width: 'min(1480px, calc(100% - 32px))',
          margin: '0 auto',
          paddingTop: 22,
          paddingBottom: 28,
        }}
      >
        <div
          className="atlas-panel atlas-panel--clear"
          style={{
            minHeight: 0,
            padding: '32px clamp(24px, 4vw, 54px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'center',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.24,
              maskImage: 'radial-gradient(circle at center, black 30%, transparent 88%)',
            }}
          >
            <MolecularBackground />
          </div>

          <div style={{ maxWidth: 680 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 48,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="atlas-kicker" style={{ marginBottom: 8 }}>
                  PeptideMaxx.AI
                </div>
                <div className="atlas-label">Biolumen Atlas for compounds, protocols, and response data</div>
              </div>
              <Link to="/auth" className="atlas-button-secondary">
                Enter Lab
              </Link>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{
                fontSize: 'clamp(46px, 7.1vw, 92px)',
                lineHeight: 0.89,
                marginBottom: 20,
                maxWidth: 680,
              }}
            >
              Precision stack intelligence in a living clinical atlas.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
              className="atlas-copy"
              style={{ fontSize: 18, maxWidth: '54ch', marginBottom: 30 }}
            >
              PeptideMaxx pairs evidence-graded compound dossiers, a harm-reduction
              pharmacology advisor, protocol logging, and biometrics in an interface
              that feels more like an instrument than a dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                marginBottom: 38,
              }}
            >
              <Link to="/app/library" className="atlas-button-primary">
                Open Atlas
              </Link>
              <Link to="/app/chat" className="atlas-button-secondary">
                Consult Dr. Voss
              </Link>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 14,
              }}
            >
              {[
                ['10', 'Curated compounds'],
                ['3', 'Decision layers'],
                ['1', 'Clinical command surface'],
              ].map(([value, label]) => (
                <div key={label} className="atlas-readout">
                  <div className="atlas-readout__value" style={{ fontSize: 42, marginBottom: 8 }}>
                    {value}
                  </div>
                  <div className="atlas-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              minHeight: 'clamp(320px, 34vw, 460px)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <BioSpecimen size="lg" label="Specimen: adaptive stack field" />

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="atlas-panel atlas-panel--soft"
              style={{
                position: 'absolute',
                top: 28,
                right: 0,
                padding: 18,
                width: 220,
              }}
            >
              <div className="atlas-label" style={{ marginBottom: 12 }}>
                Active strata
              </div>
              <div className="atlas-grid-strip">
                {['Evidence grade', 'Risk signal', 'Protocol context'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        boxShadow: '0 0 18px rgba(147,246,216,0.34)',
                      }}
                    />
                    <span className="atlas-caption" style={{ margin: 0 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="atlas-panel atlas-panel--soft"
              style={{
                position: 'absolute',
                left: 0,
                bottom: 32,
                padding: 18,
                width: 260,
              }}
            >
              <div className="atlas-label" style={{ marginBottom: 8 }}>
                Current philosophy
              </div>
              <p className="atlas-caption">
                One focal biological object, one contextual rail, and one data layer per
                screen. That keeps the interface theatrical without sacrificing trust.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        className="atlas-shell"
        style={{
          width: 'min(1480px, calc(100% - 32px))',
          margin: '0 auto',
          paddingBottom: 88,
        }}
      >
        <SectionIntro
          eyebrow="System chapters"
          title="A meaningful scroll rhythm instead of a wall of sections."
          copy="The product narrative unfolds like a biotech field guide. Each chapter changes what you see, not just what you read."
        />

        <div style={{ display: 'grid', gap: 24, marginTop: 42 }}>
          {CHAPTERS.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0.96, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="atlas-panel"
              style={{
                padding: '28px clamp(20px, 3vw, 34px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 22,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 32,
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                0{index + 1}
              </div>
              <div>
                <div className="atlas-kicker" style={{ marginBottom: 10 }}>
                  {chapter.label}
                </div>
                <h3 style={{ fontSize: 'clamp(28px, 3vw, 42px)', marginBottom: 10 }}>
                  {chapter.title}
                </h3>
                <p className="atlas-copy" style={{ maxWidth: '58ch' }}>{chapter.body}</p>
              </div>
              <div className="atlas-readout">
                <div className="atlas-label" style={{ marginBottom: 10 }}>
                  Interaction note
                </div>
                <p className="atlas-caption" style={{ maxWidth: '32ch' }}>
                  Hover reveals, clean unfolds, and restrained parallax keep motion
                  meaningful instead of decorative.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        className="atlas-shell"
        style={{
          width: 'min(1480px, calc(100% - 32px))',
          margin: '0 auto',
          paddingBottom: 88,
        }}
      >
        <SectionIntro
          eyebrow="Compound atlas"
          title="Dossiers read as layered evidence plates."
          copy="Instead of identical cards, the library behaves like a living atlas: broad scan first, mechanism detail second, intervention only when needed."
        />

        <div
          className="atlas-panel"
          style={{
            marginTop: 34,
            padding: '26px clamp(18px, 3vw, 34px)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            <div style={{ display: 'grid', gap: 14 }}>
              {compoundPreview.map((compound, index) => (
                <div
                  key={compound.id}
                  style={{
                    padding: '18px 0',
                    borderBottom:
                      index === compoundPreview.length - 1
                        ? 'none'
                        : '1px solid rgba(147,246,216,0.08)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 18,
                    alignItems: 'start',
                  }}
                >
                  <div className="atlas-label">A-{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--display)',
                        fontSize: 22,
                        fontWeight: 600,
                        color: 'var(--text)',
                        marginBottom: 8,
                      }}
                    >
                      {compound.name}
                    </div>
                    <p className="atlas-caption">{compound.summary}</p>
                  </div>
                  <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
                    <span className="atlas-chip">{compound.evidenceTier}</span>
                    <span className="atlas-chip">{compound.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="atlas-panel atlas-panel--soft"
              style={{
                padding: 22,
                display: 'grid',
                gap: 18,
                alignSelf: 'start',
              }}
            >
              <BioSpecimen size="sm" label="Evidence field" style={{ margin: '8px auto 0' }} />
              <div>
                <div className="atlas-kicker" style={{ marginBottom: 10 }}>
                  Why this feels better
                </div>
                <p className="atlas-caption">
                  Selection, context, and mechanism live together. The user never loses
                  the scientific frame while navigating compounds.
                </p>
              </div>
              <Link to="/app/library" className="atlas-button-primary">
                Browse dossiers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="atlas-shell"
        style={{
          width: 'min(1480px, calc(100% - 32px))',
          margin: '0 auto',
          paddingBottom: 32,
        }}
      >
        <div
          className="atlas-panel"
          style={{
            padding: '32px clamp(22px, 4vw, 44px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="atlas-kicker" style={{ marginBottom: 12 }}>
              Ready to move from hype to evidence
            </div>
            <h2 style={{ fontSize: 'clamp(34px, 4vw, 64px)', marginBottom: 12 }}>
              Enter the atlas and build a cleaner decision loop.
            </h2>
            <p className="atlas-copy" style={{ maxWidth: 680 }}>
              Premium biotech tone, readable data, and just enough motion to make the
              app feel alive without drifting into gimmick.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/auth" className="atlas-button-primary">
              Create account
            </Link>
            <Link to="/app/library" className="atlas-button-secondary">
              Explore preview
            </Link>
          </div>
        </div>

        <footer
          style={{
            padding: '26px 8px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div className="atlas-label">PeptideMaxx.AI</div>
          <div className="atlas-label">Compound intelligence for deliberate operators</div>
        </footer>
      </section>
    </div>
  )
}
