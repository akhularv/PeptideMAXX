import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { BioSpecimen } from '@/components/layout/BioSpecimen'
import { compounds } from '@/lib/compounds'
import { useChat } from '@/hooks/useChat'
import { useUserStore } from '@/store/useUserStore'

const SUGGESTED_PROMPTS = [
  'Build a recovery-first stack for tendon healing.',
  'Review Semax for evidence, mechanism, and protocol risk.',
  'Which compounds in my stack conflict or compound each other?',
  'Give me the strongest human-evidence compounds first.',
]

function formatTime(iso?: string) {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function TranscriptBlock({
  role,
  content,
  createdAt,
  animateIn,
}: {
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
  animateIn: boolean
}) {
  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="atlas-readout"
      style={{
        background: role === 'assistant' ? 'rgba(7, 15, 23, 0.72)' : 'rgba(9, 18, 29, 0.92)',
        marginLeft: role === 'user' ? '28px' : 0,
        marginRight: role === 'assistant' ? '28px' : 0,
        maxWidth: '84ch',
        justifySelf: role === 'user' ? 'end' : 'start',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div className="atlas-kicker">{role === 'assistant' ? 'Dr. Voss' : 'Operator prompt'}</div>
        <div className="atlas-label">{formatTime(createdAt)}</div>
      </div>

      {role === 'assistant' ? (
        <div className="atlas-prose-voss">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <p className="atlas-copy" style={{ color: 'var(--text)' }}>
          {content}
        </p>
      )}
    </motion.div>
  )
}

export function Chat() {
  const { messages, sendMessage, loading, error } = useChat()
  const { logs } = useUserStore()
  const [input, setInput] = useState('')
  const [contextOpen, setContextOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const seeded = sessionStorage.getItem('drVossInitialMessage')
    if (!seeded) return
    setInput(seeded)
    sessionStorage.removeItem('drVossInitialMessage')
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, loading])

  const recentStack = Array.from(
    new Set(
      logs
        .filter((entry) => {
          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() - 7)
          return new Date(entry.date) >= cutoff
        })
        .map((entry) => entry.compound)
    )
  )

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    setInput('')
    await sendMessage(trimmed)
  }

  return (
    <div className={contextOpen ? 'atlas-layout-chat' : 'atlas-shell'}>
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
              Consult surface
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 3.8vw, 44px)', marginBottom: 8 }}>Dr. Voss</h1>
            <p className="atlas-copy" style={{ maxWidth: '36ch', fontSize: 16 }}>
              A clinical consultation surface with context rails close enough to matter.
            </p>
          </div>

          <button className="atlas-button-secondary" onClick={() => setContextOpen((value) => !value)}>
            {contextOpen ? 'Hide context' : 'Show context'}
          </button>
        </div>

        <div
          className="atlas-scroll-region"
          style={{
            display: 'grid',
            gap: 14,
            alignContent: 'start',
            minHeight: 300,
            maxHeight: 'min(58vh, calc(100vh - 330px))',
            overflowY: 'auto',
            paddingRight: 10,
            marginBottom: 20,
          }}
        >
          {messages.length === 0 ? (
            <div className="atlas-panel atlas-panel--soft" style={{ padding: 20 }}>
              <div className="atlas-kicker" style={{ marginBottom: 14 }}>
                Suggested prompts
              </div>
              <div className="atlas-grid-strip">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    className="atlas-readout"
                    onClick={() => setInput(prompt)}
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                  >
                    <p className="atlas-copy" style={{ maxWidth: '40ch', fontSize: 15 }}>{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <TranscriptBlock
                key={`${message.role}-${message.created_at ?? index}-${index}`}
                role={message.role}
                content={message.content}
                createdAt={message.created_at}
                animateIn={index === messages.length - 1}
              />
            ))
          )}

          {loading ? (
            <div className="atlas-readout">
              <div className="atlas-kicker" style={{ marginBottom: 8 }}>
                Processing
              </div>
              <p className="atlas-caption">
                Running pharmacology review, evidence weighting, and stack heuristics.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="atlas-readout" style={{ borderColor: 'rgba(241,116,109,0.2)' }}>
              <div className="atlas-kicker" style={{ color: 'var(--danger)', marginBottom: 8 }}>
                Consultation issue
              </div>
              <p className="atlas-caption" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <textarea
            className="atlas-textarea"
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void handleSend()
              }
            }}
            placeholder="Ask about mechanism, evidence tier, dosing caveats, stack conflicts, or harm-reduction context."
            style={{ resize: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="atlas-button-primary" onClick={handleSend} disabled={loading}>
              {loading ? 'Consulting' : 'Send to Dr. Voss'}
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence initial={false}>
        {contextOpen ? (
          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="atlas-sticky-rail"
            style={{ display: 'grid', gap: 20, alignContent: 'start' }}
          >
            <section
              className="atlas-panel atlas-panel--soft"
              style={{ padding: 22, maxHeight: 'min(66vh, 780px)', overflowY: 'auto' }}
            >
              <BioSpecimen size="sm" label="Consult field" style={{ margin: '0 auto 18px' }} />
              <div className="atlas-kicker" style={{ marginBottom: 12 }}>
                Recent protocol context
              </div>
              {recentStack.length ? (
                <div className="atlas-grid-strip">
                  {recentStack.map((name) => (
                    <button
                      key={name}
                      className="atlas-readout"
                      onClick={() => setInput((current) => `${current ? `${current} ` : ''}${name}`)}
                      style={{ textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div className="atlas-label" style={{ marginBottom: 8 }}>
                        Recent compound
                      </div>
                      <div style={{ fontSize: 18, color: 'var(--text)' }}>{name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="atlas-caption" style={{ maxWidth: '30ch' }}>No recent log entries in the last seven days.</p>
              )}
            </section>

            <section className="atlas-panel atlas-panel--soft" style={{ padding: 22 }}>
              <div className="atlas-kicker" style={{ marginBottom: 14 }}>
                Quick reference
              </div>
              <div className="atlas-grid-strip">
                {compounds.slice(0, 4).map((compound) => (
                  <div key={compound.id} className="atlas-readout">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong style={{ fontSize: 18 }}>{compound.name}</strong>
                      <span className="atlas-chip">{compound.evidenceTier}</span>
                    </div>
                    <p className="atlas-caption" style={{ marginBottom: 12, maxWidth: '30ch' }}>
                      {compound.summary}
                    </p>
                    <button
                      className="atlas-button-secondary"
                      onClick={() =>
                        setInput(
                          `Review ${compound.name}. Focus on evidence strength, safety concerns, and when it is appropriate in a protocol.`
                        )
                      }
                    >
                      Queue prompt
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
