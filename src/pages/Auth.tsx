import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const hasSupabaseEnv = !!import.meta.env.VITE_SUPABASE_URL

export function Auth() {
  const { signIn, signUp, loading, confirmationPending } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Authentication failed')
    }
  }

  return (
    <div className="atlas-page">
      <div
        className="atlas-shell"
        style={{
          width: 'min(1480px, calc(100% - 32px))',
          margin: '0 auto',
          minHeight: '100vh',
          padding: '22px 0',
          display: 'grid',
          alignItems: 'stretch',
        }}
      >
        <div
          className="atlas-panel atlas-panel--clear"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 22,
            padding: 22,
          }}
        >
          <section
            style={{
              padding: '28px clamp(20px, 4vw, 44px)',
              display: 'grid',
              alignContent: 'space-between',
              minHeight: 'calc(100vh - 88px)',
            }}
          >
            <div>
              <div className="atlas-kicker" style={{ marginBottom: 12 }}>
                PeptideMaxx.AI
              </div>
              <h1 style={{ fontSize: 'clamp(44px, 6vw, 92px)', lineHeight: 0.92, marginBottom: 18 }}>
                Enter a cleaner biotech decision surface.
              </h1>
              <p className="atlas-copy" style={{ maxWidth: '56ch' }}>
                A quieter access scene, a stronger scientific point of view, and a
                product that treats compounds like evidence-backed specimens instead of tiles.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20,
                alignItems: 'center',
              }}
            >
              <div>
                <div className="atlas-grid-strip">
                  {[
                    'Evidence-aware compound atlas',
                    'Consult surface for Dr. Voss',
                    'Protocol and biometrics linked in one loop',
                  ].map((note) => (
                    <div key={note} className="atlas-readout" style={{ maxWidth: 360 }}>
                      <div className="atlas-label" style={{ marginBottom: 8 }}>
                        Interface layer
                      </div>
                      <p className="atlas-caption">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence indicator — replaces BioSpecimen on Auth page */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 12px rgba(176,84,43,0.28)',
                    flexShrink: 0,
                  }}
                />
                <span className="atlas-label">Access field</span>
              </div>
            </div>
          </section>

          <section
            className="atlas-panel atlas-panel--soft"
            style={{
              padding: '28px clamp(20px, 4vw, 34px)',
              display: 'grid',
              alignContent: 'center',
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div className="atlas-kicker" style={{ marginBottom: 10 }}>
                {mode === 'signin' ? 'Return to atlas' : 'Create access'}
              </div>
              <h2 style={{ fontSize: 42, marginBottom: 10 }}>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="atlas-caption" style={{ maxWidth: '38ch' }}>
                {mode === 'signin'
                  ? 'Resume your compound atlas, consult history, and protocol memory.'
                  : 'Start with a clean workspace for compound research, logging, and biometrics.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <div className="atlas-label" style={{ marginBottom: 8 }}>
                  Email
                </div>
                <input
                  className="atlas-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="atlas-label" style={{ marginBottom: 8 }}>
                  Password
                </div>
                <input
                  className="atlas-input"
                  type="password"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {confirmationPending ? (
                <div className="atlas-readout" style={{ borderColor: 'rgba(125,240,200,0.24)' }}>
                  <div className="atlas-kicker" style={{ color: 'var(--accent)', marginBottom: 8 }}>
                    Check your email
                  </div>
                  <p className="atlas-caption">
                    A confirmation link has been sent. Click it to activate your account, then sign in.
                  </p>
                </div>
              ) : null}
              {error ? (
                <div className="atlas-readout" style={{ borderColor: 'rgba(158,71,51,0.24)' }}>
                  <div className="atlas-kicker" style={{ color: 'var(--danger)', marginBottom: 8 }}>
                    Auth issue
                  </div>
                  <p className="atlas-caption" style={{ color: 'var(--danger)' }}>
                    {error}
                  </p>
                </div>
              ) : null}

              <button className="atlas-button-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Processing' : mode === 'signin' ? 'Enter workspace' : 'Create workspace'}
              </button>
            </form>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 18,
              }}
            >
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                  setError(null)
                }}
                className="atlas-button-secondary"
                type="button"
              >
                {mode === 'signin' ? 'Need an account' : 'Already have access'}
              </button>

              {!hasSupabaseEnv && (
                <Link to="/app/library" className="atlas-button-secondary">
                  Preview app
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
