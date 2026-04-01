import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import brainHero from '@/assets/brain-hero.png'

type SectionId = 'dashboard' | 'workout' | 'mental' | 'atlas'

interface StageSignal {
  label: string
  x: string
  y: string
  tone: 'mint' | 'blue' | 'amber' | 'rose'
}

interface StageMetric {
  label: string
  value: string
}

interface LandingSection {
  id: SectionId
  step: string
  eyebrow: string
  title: string
  body: string
  supporting: string
  chips: string[]
  accent: string
  accentRgb: string
  glow: string
  metrics: StageMetric[]
  signals: StageSignal[]
}

const SECTIONS: LandingSection[] = [
  {
    id: 'dashboard',
    step: '01',
    eyebrow: 'Personal dashboard',
    title: 'Start with a private surface that actually belongs to the user.',
    body:
      'The first signed-in moment should not feel generic. Metrics, weight shifts, dosage rhythm, recovery notes, and protocol context need to sit in one place so a user immediately understands where their body is trending and what changed it.',
    supporting:
      'This is the anchor for the rest of the product: a personal dashboard built from biometrics, stack history, and the small observations that usually get lost.',
    chips: ['Weight + metrics', 'Dosage context', 'Recovery notes'],
    accent: '#9df0da',
    accentRgb: '157, 240, 218',
    glow: 'radial-gradient(circle at 24% 28%, rgba(157,240,218,0.34), transparent 34%), radial-gradient(circle at 72% 64%, rgba(76,118,255,0.22), transparent 26%)',
    metrics: [
      { label: 'Weight', value: '81.6kg' },
      { label: 'Dose cadence', value: 'Stable' },
      { label: 'Recovery', value: '+14%' },
    ],
    signals: [
      { label: 'Biometric rack', x: '18%', y: '26%', tone: 'mint' },
      { label: 'Protocol context', x: '68%', y: '20%', tone: 'blue' },
      { label: 'Trend layer', x: '60%', y: '68%', tone: 'mint' },
    ],
  },
  {
    id: 'workout',
    step: '02',
    eyebrow: 'Workout journal',
    title: 'Turn every session into a visual training record, not a forgotten note.',
    body:
      'The workout journal should let people log every exercise in a session, attach progress photos, and build an archive of how they train over time. AI then interprets that record, identifies muscle groups being hit, and shows where the work is accumulating.',
    supporting:
      'The result is a journal that can connect stack changes to performance, volume, recovery, and physique progression instead of treating training like an afterthought.',
    chips: ['Photos per workout', 'Exercise-by-exercise', 'AI muscle mapping'],
    accent: '#ffb369',
    accentRgb: '255, 179, 105',
    glow: 'radial-gradient(circle at 18% 72%, rgba(255,179,105,0.34), transparent 30%), radial-gradient(circle at 76% 18%, rgba(255,109,88,0.2), transparent 26%)',
    metrics: [
      { label: 'Session', value: 'Push A' },
      { label: 'Exercises', value: '11' },
      { label: 'Muscles hit', value: 'Chest / Delts' },
    ],
    signals: [
      { label: 'Photo capture', x: '24%', y: '24%', tone: 'amber' },
      { label: 'Volume map', x: '70%', y: '34%', tone: 'rose' },
      { label: 'Muscle AI', x: '54%', y: '74%', tone: 'amber' },
    ],
  },
  {
    id: 'mental',
    step: '03',
    eyebrow: 'Mental journal',
    title: 'Let AI check in on how a stack feels in real life, not only on paper.',
    body:
      'A mental journal adds an ongoing conversation around mood, focus, drive, sleep, and emotional drift after starting or changing a stack. Instead of one-off notes, it creates a timeline of how the user is actually feeling while the protocol evolves.',
    supporting:
      'That makes the product useful for subtle effects too, especially the ones that show up in motivation, calmness, irritability, cognition, or day-to-day energy before they show up anywhere else.',
    chips: ['Mood tracking', 'Sleep + focus', 'AI check-ins'],
    accent: '#96a7ff',
    accentRgb: '150, 167, 255',
    glow: 'radial-gradient(circle at 74% 24%, rgba(150,167,255,0.32), transparent 30%), radial-gradient(circle at 30% 76%, rgba(224,112,255,0.18), transparent 24%)',
    metrics: [
      { label: 'Mood delta', value: '+1.4' },
      { label: 'Sleep', value: '7h 42m' },
      { label: 'Check-ins', value: '4 this week' },
    ],
    signals: [
      { label: 'AI dialogue', x: '18%', y: '22%', tone: 'blue' },
      { label: 'Sleep trend', x: '72%', y: '26%', tone: 'mint' },
      { label: 'Mood drift', x: '58%', y: '72%', tone: 'rose' },
    ],
  },
  {
    id: 'atlas',
    step: '04',
    eyebrow: 'Compound atlas',
    title: 'Keep research, evidence, and mechanism in the same operating field.',
    body:
      'The atlas should stay close to the journals so users can move from a feeling or a training outcome straight into evidence-backed compound research, mechanism review, safety context, and dose framing without leaving the product.',
    supporting:
      'That closes the loop between what the user reads, what they run, and what they observe, so the app behaves like an intelligent system rather than a collection of isolated pages.',
    chips: ['Evidence tiers', 'Mechanism view', 'Conflict watch'],
    accent: '#ffe48d',
    accentRgb: '255, 228, 141',
    glow: 'radial-gradient(circle at 70% 22%, rgba(255,228,141,0.3), transparent 28%), radial-gradient(circle at 18% 70%, rgba(125,240,200,0.18), transparent 24%)',
    metrics: [
      { label: 'Evidence', value: 'Clinical-first' },
      { label: 'Mechanism', value: 'Mapped' },
      { label: 'Risk watch', value: 'Live' },
    ],
    signals: [
      { label: 'Evidence layer', x: '20%', y: '30%', tone: 'amber' },
      { label: 'Mechanism note', x: '68%', y: '20%', tone: 'mint' },
      { label: 'Conflict rail', x: '62%', y: '70%', tone: 'blue' },
    ],
  },
]

function WordGlowParagraph({
  text,
  active,
}: {
  text: string
  active: boolean
}) {
  const words = useMemo(() => text.split(/\s+/), [text])

  return (
    <p className="landing-rail__body">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="landing-rail__word"
          animate={{
            opacity: active ? 1 : 0.28,
            color: active ? 'rgba(244, 246, 244, 0.98)' : 'rgba(196, 204, 202, 0.46)',
            textShadow: active ? '0 0 18px rgba(var(--landing-accent-rgb), 0.2)' : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={{
            duration: 0.28,
            delay: active ? index * 0.012 : 0,
            ease: 'easeOut',
          }}
        >
          {word}
          {' '}
        </motion.span>
      ))}
    </p>
  )
}

function Stage({
  section,
  compact = false,
}: {
  section: LandingSection
  compact?: boolean
}) {
  return (
    <div
      className={compact ? 'landing-stage landing-stage--compact' : 'landing-stage'}
      data-testid={compact ? `landing-stage-${section.id}-mobile` : 'landing-stage'}
      data-stage-state={section.id}
      style={
        {
          '--landing-accent': section.accent,
          '--landing-accent-rgb': section.accentRgb,
          '--landing-glow': section.glow,
        } as React.CSSProperties
      }
    >
      <div className="landing-stage__frame">
        <div className="landing-stage__wash" />
        <div className="landing-stage__mesh" />
        <img className="landing-stage__brain" src={brainHero} alt="" />
        <div className="landing-stage__shade" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${section.id}-${compact ? 'compact' : 'full'}`}
            className="landing-stage__content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="landing-stage__card landing-stage__card--headline">
              <div className="atlas-kicker" style={{ marginBottom: 10 }}>
                {section.eyebrow}
              </div>
              <h3 className="landing-stage__title">{section.title}</h3>
            </div>

            <div className="landing-stage__metric-list" data-testid="landing-stage-metrics">
              {section.metrics.map((metric) => (
                <div key={metric.label} className="landing-stage__metric">
                  <span className="atlas-label">{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>

            {section.signals.map((signal) => (
              <div
                key={signal.label}
                className={`landing-stage__signal landing-stage__signal--${signal.tone}`}
                style={{ left: signal.x, top: signal.y }}
              >
                <span className="landing-stage__signal-dot" />
                <span className="landing-stage__signal-label">{signal.label}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function Landing() {
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    dashboard: null,
    workout: null,
    mental: null,
    atlas: null,
  })
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('dashboard')
  const [hoverSectionId, setHoverSectionId] = useState<SectionId | null>(null)

  useEffect(() => {
    let frame = 0

    const updateActiveSection = () => {
      const anchor = window.innerHeight * 0.46
      let next = activeSectionId
      let smallestDistance = Number.POSITIVE_INFINITY

      for (const section of SECTIONS) {
        const element = sectionRefs.current[section.id]
        if (!element) continue

        const rect = element.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const distance = Math.abs(center - anchor)

        if (distance < smallestDistance) {
          smallestDistance = distance
          next = section.id
        }
      }

      setActiveSectionId((current) => (current === next ? current : next))
      frame = 0
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateActiveSection)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [activeSectionId])

  const displaySection =
    SECTIONS.find((section) => section.id === (hoverSectionId ?? activeSectionId)) ?? SECTIONS[0]

  return (
    <div className="atlas-page landing-page">
      <header className="landing-topbar" data-testid="landing-topbar">
        <Link to="/" className="landing-topbar__brand">
          <span className="landing-topbar__dot" aria-hidden="true" />
          <span>PEPTIDEMAXX</span>
        </Link>

        <Link to="/auth" className="atlas-button-secondary landing-topbar__cta" data-testid="landing-signin-top">
          Sign in
        </Link>
      </header>

      <section className="landing-hero" data-testid="landing-hero">
        <div className="landing-hero__media" aria-hidden="true">
          <img className="landing-hero__image" src={brainHero} alt="" />
          <div className="landing-hero__overlay" />
        </div>

        <div className="landing-shell landing-hero__shell">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="landing-hero__content"
          >
            <div className="atlas-kicker landing-hero__kicker">Brain-led protocol intelligence</div>
            <h1 className="landing-hero__title" data-testid="landing-hero-title">
              PEPTIDEMAXX
            </h1>
            <p className="landing-hero__summary">
              A personal operating layer for peptides, metrics, workout logging, and
              AI-guided mental check-ins.
            </p>

            <div className="landing-hero__actions">
              <a href="#narrative" className="atlas-button-primary">
                Enter the narrative
              </a>
              <Link to="/auth" className="atlas-button-secondary">
                Open your account
              </Link>
            </div>

            <div className="landing-hero__signals">
              {['Metrics + weights', 'Dosage memory', 'Workout + mental journals'].map((signal) => (
                <span key={signal} className="atlas-chip">
                  {signal}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="landing-main">
        <section id="narrative" className="landing-narrative">
          <div className="landing-shell landing-narrative__intro">
            <div className="atlas-kicker" style={{ marginBottom: 16 }}>
              The product story
            </div>
            <h2 className="landing-section__title">
              One evolving brain. Four sections that explain why the signed-in product matters.
            </h2>
          </div>

          <div className="landing-shell landing-narrative__grid">
            <div className="landing-stage-column">
              <div className="landing-stage-column__sticky">
                <div className="landing-stage-column__caption atlas-label">Pinned visual stage</div>
                <Stage section={displaySection} />
              </div>
            </div>

            <div className="landing-rail" data-testid="landing-rail">
              {SECTIONS.map((section) => {
                const isActive = displaySection.id === section.id

                return (
                  <article
                    key={section.id}
                    ref={(element) => {
                      sectionRefs.current[section.id] = element
                    }}
                    className={isActive ? 'landing-rail__section is-active' : 'landing-rail__section'}
                    data-section-id={section.id}
                    data-active={isActive ? 'true' : 'false'}
                    data-testid={`landing-section-${section.id}`}
                    style={
                      {
                        '--landing-accent': section.accent,
                        '--landing-accent-rgb': section.accentRgb,
                      } as React.CSSProperties
                    }
                    onMouseEnter={() => setHoverSectionId(section.id)}
                    onMouseLeave={() => setHoverSectionId(null)}
                  >
                    <div className="landing-rail__section-inner atlas-panel atlas-panel--soft">
                      <div className="landing-rail__step">{section.step}</div>

                      <button
                        type="button"
                        className="landing-rail__trigger"
                        data-section-trigger={section.id}
                        onFocus={() => setHoverSectionId(section.id)}
                        onBlur={() => setHoverSectionId(null)}
                        onMouseEnter={() => setHoverSectionId(section.id)}
                      >
                        <span className="atlas-kicker landing-rail__eyebrow">{section.eyebrow}</span>
                        <h3 className="landing-rail__title">{section.title}</h3>
                      </button>

                      <div className="landing-stage-inline">
                        <Stage section={section} compact />
                      </div>

                      <WordGlowParagraph text={section.body} active={isActive} />
                      <p className="atlas-caption landing-rail__supporting">{section.supporting}</p>

                      <div className="landing-rail__chips">
                        {section.chips.map((chip) => (
                          <span key={chip} className="atlas-chip">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-shell">
            <div className="atlas-panel landing-cta__panel">
              <div>
                <div className="atlas-kicker" style={{ marginBottom: 16 }}>
                  Ready to personalize it
                </div>
                <h2 className="landing-section__title landing-cta__title">
                  Sign in and let the dashboard, journals, and atlas start connecting.
                </h2>
                <p className="atlas-copy landing-cta__copy">
                  The public page explains the system. The private product should reflect
                  the user’s body, stack, and progress immediately.
                </p>
              </div>

              <div className="landing-cta__actions">
                <Link to="/auth" className="atlas-button-primary" data-testid="landing-signin-bottom">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
