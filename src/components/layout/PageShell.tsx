/**
 * Wraps page content with left margin to clear the fixed 240px sidebar.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginLeft: '240px', minHeight: '100vh', padding: '32px', background: '#060B1A' }}>
      {children}
    </div>
  )
}
