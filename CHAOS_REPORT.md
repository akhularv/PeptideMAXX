# Chaos Report — PeptideMaxx.AI
Date: 2026-03-31  |  Tester: Chaos Engineer Agent
Status: CRITICAL FINDINGS PRESENT

---

## 1. Chaos Test Suite

### Test: C-01 — Missing env vars: silent blank UI vs graceful degradation

- **Target module**: `src/lib/supabase.ts`, `src/components/layout/ProtectedRoute.tsx`
- **Injection type**: Missing env var (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY absent)
- **Input**: Application loaded with no `.env` file present
- **Expected behavior**: Visible degraded-mode notice; app remains navigable; no crash
- **Observed behavior**: `supabase.ts` falls back to `'https://placeholder.supabase.co'` and `'placeholder-anon-key'`, emitting only a `console.warn`. `ProtectedRoute` reads `!import.meta.env.VITE_SUPABASE_URL` and enters demo mode, bypassing the auth check entirely and showing the full app. The `console.warn` in `supabase.ts` fires unconditionally (not gated by DEV), so it does appear in production consoles — but there is zero UI-level indication that auth and data features are disabled.
- **Result**: SILENT_FAIL
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. The missing-env path must surface a visible banner to operators who misconfigure deployment.

---

### Test: C-02 — Unknown route navigation (e.g. `/app/doesnotexist`, `/unknown`)

- **Target module**: `src/App.tsx` (router)
- **Injection type**: Unknown URL path
- **Input**: Direct navigation to `/app/doesnotexist` and `/xyz`
- **Expected behavior**: 404 page, redirect to `/`, or fallback route
- **Observed behavior**: The `<Routes>` tree has no catch-all `<Route path="*">` defined. Navigating to `/app/doesnotexist` matches the `/app` parent (renders `<ProtectedRoute><Dashboard /></ProtectedRoute>`) and then renders an empty `<Outlet />` — a completely blank content area with the nav shell visible but no content and no error. Navigating to `/xyz` renders nothing at all — blank page with no nav.
- **Result**: SILENT_FAIL
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. Both the `/app/*` and top-level `*` paths need a 404 fallback route.

---

### Test: C-03 — Unauthenticated direct navigation to protected route

- **Target module**: `src/components/layout/ProtectedRoute.tsx`
- **Injection type**: Session null, direct navigation to `/app/library`
- **Expected behavior**: Redirect to `/auth`
- **Observed behavior**: On first render `checking` is `true` and `demoMode` is evaluated from `!import.meta.env.VITE_SUPABASE_URL`. If Supabase env IS set but session is null, the user sees a blank dark screen while `getSession()` resolves (correct behavior). However, `useAuth` in `TopNav` also calls `getSession()` and sets up `onAuthStateChange` independently of `ProtectedRoute`. Both run simultaneously, each setting `session` in the Zustand store. In the worst case, `onAuthStateChange` fires a `SIGNED_OUT` event after `ProtectedRoute` has already moved past the `checking` gate but before the `Navigate` renders — this results in the page briefly showing before redirecting. Not a silent fail, but a flash-of-content leak.
- **Result**: PASS (redirect occurs) with WARNING (flash-of-content race)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder.

---

### Test: C-04 — Session expiry mid-session (token revoked / expired)

- **Target module**: `src/hooks/useAuth.ts`, `src/components/layout/ProtectedRoute.tsx`
- **Injection type**: Session becomes null mid-session (simulated by `onAuthStateChange` firing `SIGNED_OUT`)
- **Expected behavior**: User is redirected to `/auth`; in-flight data calls handle the auth error gracefully
- **Observed behavior**: `useAuth` subscribes to `onAuthStateChange` and calls `setSession(null)` on `SIGNED_OUT`. This updates the Zustand store. `ProtectedRoute` reads `session` from that store but does NOT resubscribe to changes after the initial check — it only evaluates `session` at mount time. A mid-session expiry silently leaves the user on the protected page with a null session. Subsequent Supabase calls fail silently (RLS will reject them) with errors surfaced only via `setError` in hooks — the user is never redirected to `/auth`.
- **Result**: SILENT_FAIL
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. `ProtectedRoute` must subscribe to the Zustand `session` field reactively so it re-renders and redirects when `onAuthStateChange` fires.

---

### Test: C-05 — Trends page: network error / rejected Promise (no `.catch`)

- **Target module**: `src/pages/Trends.tsx`
- **Injection type**: Network failure causing any of the three fetch functions to throw
- **Expected behavior**: Error state rendered to user; `loading` set to false
- **Observed behavior**: The `useEffect` in `Trends` calls `Promise.all([...]).then(...)` with no `.catch()`. If any fetch throws (network down, Supabase timeout, DNS failure), the `Promise.all` rejection is unhandled. `setLoading(false)` is never called — the page stays in a permanent loading spinner state ("Loading intelligence feed…") with no error displayed. This is a silent hang, not a crash.
- **Result**: SILENT_FAIL
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. Add `.catch()` to the `Promise.all` chain in `Trends.tsx` line 307, call `setLoading(false)` in the catch handler, and render an error state.

---

### Test: C-06 — Trends page: empty arrays / mock data shown in live mode without label

- **Target module**: `src/pages/Trends.tsx`, `src/lib/trends.ts`
- **Injection type**: Supabase connected but DB tables empty (zero posts after fresh schema deployment)
- **Expected behavior**: Empty state or "pipeline not yet run" message
- **Observed behavior**: `fetchTrendPosts` applies `return posts.length > 0 ? posts : MOCK_POSTS` — when Supabase is connected and the DB is empty, mock data is returned silently. `fetchTrendSignals` and `fetchTrackedSources` behave the same way. In a production deployment where the scrape pipeline hasn't run yet, users see fabricated demo data with no indication it isn't real.
- **Result**: SILENT_FAIL (misleading output — mock data presented as real in production)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder.

---

### Test: C-07 — PostCard rendered with empty `compound_mentions` array

- **Target module**: `src/pages/Trends.tsx` — `PostCard` component
- **Injection type**: `SocialPost` with `compound_mentions: []`
- **Expected behavior**: Card renders without crash; footer skips `EvidenceDot`
- **Observed behavior**: `const topMention = post.compound_mentions[0]` yields `undefined`. The guard `{topMention && <EvidenceDot ... />}` and optional chaining in `handleAskVoss` (`post.compound_mentions[0]?.compound_name ?? ''`) both handle this correctly. No crash.
- **Result**: PASS
- **Severity**: N/A

---

### Test: C-08 — Library page: all compounds filtered out (empty `filtered` array)

- **Target module**: `src/pages/Library.tsx`
- **Injection type**: Search string matching no compound
- **Expected behavior**: Right rail shows "No compound matches the current filters." message
- **Observed behavior**: `selectedCompound = filtered.find(...) ?? filtered[0] ?? compounds[0]`. When `filtered` is empty, `compounds[0]` is used as the fallback — so the right rail always shows a compound dossier even when the center list is empty. The right rail and center list are out of sync: zero rows in the center, one full dossier in the right rail.
- **Result**: SILENT_FAIL (UI contradiction — right rail shows a compound, center list is empty)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder. `selectedCompound` should be `null` when `filtered` is empty.

---

### Test: C-09 — Metrics page: `mostUsed()` called on empty logs array

- **Target module**: `src/pages/Metrics.tsx` — `mostUsed()` function
- **Injection type**: `logs = []`
- **Expected behavior**: Safe fallback value returned
- **Observed behavior**: Line 11: `if (!logs.length) return '—'` guard is present. Returns `'—'` safely.
- **Result**: PASS
- **Severity**: N/A

---

### Test: C-10 — Metrics page: `saveMetrics()` swallows Supabase errors

- **Target module**: `src/hooks/useMetrics.ts` — `saveMetrics()`
- **Injection type**: Supabase upsert fails (network error, RLS violation, invalid data)
- **Expected behavior**: Error surfaced to user; loading state cleared
- **Observed behavior**: `saveMetrics` calls `supabase.from('user_metrics').upsert(...).select().single()` with no try/catch and no check on the destructured `error` field. If the upsert fails and Supabase returns `{ data: null, error: {...} }`, the error is discarded — `setLoading(false)` is called but no error state is set and no UI feedback is given. If the call throws (network error), the unhandled rejection propagates to the caller. The "Save biometrics" button in `Metrics.tsx` disables briefly and then re-enables, with no indication to the user that the save failed.
- **Result**: SILENT_FAIL
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. Add try/catch, check the Supabase error field, and surface failure state through the hook's return value.

---

### Test: C-11 — Schema name mismatch: `log_entries` (code) vs `public.logs` (schema)

- **Target module**: `src/hooks/useLog.ts`, `supabase/schema.sql`
- **Injection type**: Code-schema mismatch verification
- **Input**: `useLog.ts` queries `.from('log_entries')` at lines 28, 58, and 78
- **Expected behavior**: Table name in code matches schema definition
- **Observed behavior**: `supabase/schema.sql` creates `public.logs`. The code queries `log_entries` at all three call sites. With a live Supabase connection, every log operation — load, add, delete — will fail with a table-not-found error. The initial fetch in `useEffect` catches the error and calls `setError(err.message)` but `Log.tsx` renders "No entries yet" (empty state) rather than an error message — so the real failure is invisible to the user. Add and delete errors do surface via `setError` but only in a hook-level state that nothing in `Log.tsx` renders.
- **Result**: SILENT_FAIL (wrong-table error masquerades as "empty log")
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. Align the table name: either rename `public.logs` → `log_entries` in the schema migration, or update all three `.from('log_entries')` calls in `useLog.ts` to `.from('logs')`.

---

### Test: C-12 — Anthropic API key exposed in browser bundle (VITE_ANTHROPIC_API_KEY)

- **Target module**: `src/lib/api.ts`
- **Injection type**: Security probe — secret key inlined in client JS bundle
- **Input**: `VITE_` prefixed variables are inlined into the Vite bundle at build time, readable by anyone who downloads the built JS
- **Expected behavior**: README states `VITE_ANTHROPIC_API_KEY — backend proxy only, never expose in frontend`
- **Observed behavior**: `api.ts` line 40 reads `import.meta.env.VITE_ANTHROPIC_API_KEY` and uses it to call `https://api.anthropic.com/v1/messages` directly from the browser. The header `'anthropic-dangerous-direct-browser-access': 'true'` confirms the direct browser call is intentional. Any user inspecting `dist/assets/index-*.js` can extract the API key and use it at will. The README documentation directly contradicts the implementation.
- **Result**: SILENT_FAIL (security contract violated; no code-level enforcement or warning)
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. Requires architectural decision: either implement a backend proxy (Supabase Edge Function) that holds the key server-side, or explicitly document and accept the client-side key risk. At minimum, the README contradiction must be resolved.

---

### Test: C-13 — `process-posts` edge function: bare `JSON.parse` on Claude output

- **Target module**: `supabase/functions/process-posts/index.ts` — `extractMentions()`
- **Injection type**: Malformed/non-JSON response from Claude API
- **Input**: Claude returns text with prose before the JSON array, or a non-array JSON value
- **Expected behavior**: Parse error caught; error logged; post left for retry with observability
- **Observed behavior**: Line 127: `const raw: Record<string, unknown>[] = JSON.parse(text)` — no try/catch. If Claude returns non-JSON, `JSON.parse` throws. The outer `catch { }` (bare catch, empty body) on line 73 swallows the error entirely — no logging, no metric, nothing. The post stays at `processed=false` and retries on every scrape run indefinitely, with zero visibility into why.
- **Result**: SILENT_FAIL (error swallowed, infinite retry loop with no observability)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder.

---

### Test: C-14 — `recomputeTrends` uses INSERT instead of UPSERT, accumulates stale rows

- **Target module**: `supabase/functions/process-posts/index.ts` — `recomputeTrends()`
- **Injection type**: Function called multiple times (every 12-hour scrape cycle)
- **Expected behavior**: `trend_signals` reflects only the current 7-day window; no row accumulation
- **Observed behavior**: Line 157: `await supabase.from('trend_signals').insert(signals)` is a plain INSERT. Every scrape run appends fresh rows. The `fetchTrendSignals` query in `trends.ts` (line 82-96) orders by `mention_count DESC` with no `WHERE computed_at = latest` filter — after multiple cycles, stale rows from prior computations compete with fresh rows in the sort. Compound keys appear multiple times with varying counts, producing unpredictable and incorrect trending output. Additionally, `compound_name` is absent from the INSERT payload (only `compound_key` is inserted), so the fallback `COMPOUND_NAMES` dict in `trends.ts` is the only source of display names.
- **Result**: SILENT_FAIL (data correctness silently degrades with each scrape cycle)
- **Severity**: CRITICAL
- **Fix applied**: DEFERRED to Master Coder. Add a `WHERE computed_at >= now() - interval '13 hours'` filter to `fetchTrendSignals`, or implement delete-then-insert in `recomputeTrends`, or add a unique constraint on `compound_key` and use UPSERT.

---

### Test: C-15 — Auth page "Preview app" link creates redirect loop when Supabase is configured

- **Target module**: `src/pages/Auth.tsx`, `src/components/layout/ProtectedRoute.tsx`
- **Injection type**: UI bypass / redirect loop probe
- **Input**: Click "Preview app" (`<Link to="/app/library">`) on the Auth page when `VITE_SUPABASE_URL` is set
- **Expected behavior**: Either preview loads (demo mode) or user is shown a message
- **Observed behavior**: When Supabase env IS configured, `ProtectedRoute.demoMode` is `false`. The user lands on `/app/library` → `ProtectedRoute` checks session (null on first visit) → redirects to `/auth` → Auth page shows "Preview app" link again → infinite loop.
- **Result**: SILENT_FAIL (redirect loop, no error message)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder. Guard the link with `{!hasSupabaseEnv && <Link to="/app/library">Preview app</Link>}`, or change the target to the landing page.

---

### Test: C-16 — `useLog.ts` optimistic delete has no rollback on failure

- **Target module**: `src/hooks/useLog.ts` — `deleteEntry()`
- **Injection type**: Delete Supabase call fails
- **Expected behavior**: Entry re-added to list on failure
- **Observed behavior**: Code comment acknowledges no rollback ("no rollback needed for delete failures in MVP"). Entry disappears from UI immediately; error is set but entry is not restored. Refresh brings it back. UX inconsistency only — no data corruption.
- **Result**: WARNING (acknowledged in code)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder per MVP note.

---

### Test: C-17 — `signUp` navigates to `/app/metrics` before email confirmation

- **Target module**: `src/hooks/useAuth.ts` — `signUp()`
- **Injection type**: Supabase project with email confirmation enabled (Supabase default)
- **Expected behavior**: User shown "check your email" message when session is null after signup
- **Observed behavior**: `signUp()` calls `supabase.auth.signUp(...)` and immediately calls `navigate('/app/metrics')`. When email confirmation is required, Supabase returns `{ data: { user: {...}, session: null }, error: null }`. Navigate fires, landing the user on a protected route with no session → `ProtectedRoute` bounces them back to `/auth` with no explanation. The user has no idea why they were redirected or that email confirmation is pending.
- **Result**: SILENT_FAIL (no email-confirmation UX)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder. Check `data.session` after `signUp`; if null, set an info message ("Check your email to confirm your account") and do not navigate.

---

### Test: C-18 — Build: TypeScript compilation and bundle integrity

- **Target module**: Entire codebase (`tsc -b && vite build`)
- **Injection type**: Full build verification
- **Expected behavior**: Clean compile, zero TypeScript errors
- **Observed behavior**: Build completes successfully. Zero TypeScript compiler errors. Zero Vite warnings. Bundle outputs: `index-*.js` 483 kB (gzip 151 kB), `Metrics-*.js` 345 kB (gzip 102 kB — recharts lazy chunk), `Trends-*.js` 21 kB (gzip 6 kB), `supabase-*.js` 234 kB (gzip 65 kB). Note: `brain-hero-*.png` is 1005 kB uncompressed — no image compression in pipeline.
- **Result**: PASS
- **Severity**: N/A

---

### Test: C-19 — CSS: two `index.css` files, orphaned Vite default stylesheet

- **Target module**: `src/index.css`, `src/App.css`, `src/styles/index.css`
- **Injection type**: CSS conflict probe
- **Expected behavior**: One authoritative CSS entry point; no conflicting `:root` variable definitions
- **Observed behavior**: `src/index.css` defines a light/dark-mode `:root` (Vite template defaults: `--text: #6b6375`, `--accent: #aa3bff`). `src/styles/index.css` defines the Atlas dark-mode `:root` (`--text: #F4F6F4`, `--accent: #7DF0C8`). `main.tsx` imports only `./styles/index.css`. `src/index.css` and `src/App.css` are not imported anywhere — orphaned dead files. No active CSS conflict, but the orphaned files contain conflicting variable definitions that would cause silent visual regressions if accidentally re-imported.
- **Result**: PASS (with WARNING — dead files)
- **Severity**: WARNING
- **Fix applied**: None — deferred to Master Coder for cleanup.

---

### Test: C-20 — Router: HashRouter vs BrowserRouter selection in production (GitHub Pages)

- **Target module**: `src/App.tsx`, `vite.config.ts`
- **Injection type**: Production build environment boundary
- **Expected behavior**: `HashRouter` selected when `BASE_URL === '/PeptideMAXX/'`
- **Observed behavior**: `vite.config.ts` sets `base: mode === 'production' ? '/PeptideMAXX/' : '/'`. At runtime `import.meta.env.BASE_URL` is `/PeptideMAXX/`, correctly selecting `HashRouter`. All client-side routes function. External links must use hash format (`/#/app/library`) — BrowserRouter-style deep links to GitHub Pages will 404 at the CDN.
- **Result**: PASS (logic correct; operational caveat noted)
- **Severity**: N/A

---

## 2. Silent Failures Found

Silent failures (wrong answer, no error) are the most dangerous.

| ID | Location | Failure Description |
|----|----------|---------------------|
| C-01 | supabase.ts / ProtectedRoute | No UI-level indication when Supabase env vars are absent; operator misconfiguration is invisible to users |
| C-02 | App.tsx router | Unknown routes render blank page; no 404 state |
| C-04 | ProtectedRoute | Session expiry mid-session leaves user on protected page; subsequent Supabase calls fail silently with RLS errors |
| C-05 | Trends.tsx useEffect | Network error causes permanent loading spinner; `loading` never set to false; no error message |
| C-06 | trends.ts | Mock data displayed as real data when Supabase is connected but DB is empty |
| C-10 | useMetrics.ts | `saveMetrics()` discards Supabase error; user has no indication save failed |
| C-11 | useLog.ts | Table name `log_entries` does not exist (schema defines `public.logs`); Log page shows "No entries yet" instead of the real DB error |
| C-12 | api.ts | Anthropic API key exposed in client bundle; contradicts README security contract with no code-level warning |
| C-14 | process-posts/index.ts | `trend_signals` INSERT accumulates stale rows on every scrape cycle; trend reads silently degrade in accuracy |
| C-15 | Auth.tsx | "Preview app" link creates infinite redirect loop when Supabase env is configured |

---

## 3. Critical Findings Summary

| ID | Module | Injection | Failure Type | Status |
|----|--------|-----------|--------------|--------|
| C-01 | supabase.ts, ProtectedRoute | Missing env vars | Silent — no UI degradation notice | DEFERRED |
| C-02 | App.tsx | Unknown routes | Silent — blank page, no 404 route | DEFERRED |
| C-04 | ProtectedRoute | Session expiry mid-session | Silent — user stays on protected page indefinitely | DEFERRED |
| C-05 | Trends.tsx | Network error on Promise.all | Silent — permanent loading spinner, no error state | DEFERRED |
| C-10 | useMetrics.ts | saveMetrics() Supabase failure | Silent — save error discarded, no user feedback | DEFERRED |
| C-11 | useLog.ts + schema.sql | Table name mismatch (log_entries vs logs) | Silent — log page shows empty instead of DB error | DEFERRED |
| C-12 | api.ts | Anthropic key in browser bundle | Security — key exposed, README contradicted | DEFERRED |
| C-14 | process-posts edge fn | INSERT vs UPSERT in recomputeTrends | Silent data corruption — stale rows accumulate | DEFERRED |

---

## 4. Fixes Applied

No direct code fixes were applied in this session. All 8 critical findings are deferred to Master Coder.

This is intentional: all critical findings involve logic/architecture changes (session lifecycle, router fallbacks, schema alignment) or security architecture decisions (key exposure) — outside the Chaos Engineer's authorization.

---

## 5. Remaining Risks

### CRITICAL — Must resolve before Security Auditor sign-off

**C-02: No wildcard/catch-all route**
- File: `/Users/akhularvind/peptidemaxx/src/App.tsx`
- Fix: Add `<Route path="*" element={<NotFound />} />` at both the top-level and inside the `/app` nested route group.

**C-04: ProtectedRoute does not react to mid-session expiry**
- File: `/Users/akhularvind/peptidemaxx/src/components/layout/ProtectedRoute.tsx`
- Fix: Remove local `checking` state. Subscribe directly to `useUserStore((s) => s.session)` so the component re-renders when `onAuthStateChange` fires and redirects immediately on expiry.

**C-05: Trends useEffect — missing `.catch()`**
- File: `/Users/akhularvind/peptidemaxx/src/pages/Trends.tsx`, lines 306–317
- Fix: Chain `.catch((err) => { setLoading(false); setError(String(err)) })` on the `Promise.all`. Add an `error` state variable and render it when non-null.

**C-10: saveMetrics() swallows errors**
- File: `/Users/akhularvind/peptidemaxx/src/hooks/useMetrics.ts`
- Fix: Wrap the upsert in try/catch, check the destructured Supabase `error` field, add an `error: string | null` field to the hook return, and render it in `Metrics.tsx`.

**C-11: Table name mismatch — `log_entries` vs `logs`**
- Files: `/Users/akhularvind/peptidemaxx/src/hooks/useLog.ts` (lines 28, 58, 78) and `/Users/akhularvind/peptidemaxx/supabase/schema.sql`
- Fix: Choose one canonical name. Recommendation: update `useLog.ts` to `.from('logs')` to match the existing schema without requiring a migration.

**C-12: Anthropic API key exposed in browser bundle**
- Files: `/Users/akhularvind/peptidemaxx/src/lib/api.ts`, `/Users/akhularvind/peptidemaxx/README.md`
- Fix (option A — recommended): Create a Supabase Edge Function `chat-voss` holding `ANTHROPIC_API_KEY` as a server-side secret. Update `api.ts` to call that edge function. Remove `VITE_ANTHROPIC_API_KEY` from `.env.example`.
- Fix (option B — minimal): Remove the misleading README statement; add a visible `console.warn` in DEV warning that the key will be bundled; document the risk explicitly in README.

**C-01: No UI-level degraded mode notice**
- File: `/Users/akhularvind/peptidemaxx/src/App.tsx` or `src/components/layout/Dashboard.tsx`
- Fix: When `!hasSupabaseEnv`, render a visible banner: "Demo mode — auth and data persistence disabled."

**C-14: `trend_signals` INSERT accumulates stale rows**
- File: `/Users/akhularvind/peptidemaxx/supabase/functions/process-posts/index.ts`, `recomputeTrends()` (line 157)
- Fix: In `fetchTrendSignals` (`src/lib/trends.ts` line 82), add `.gte('computed_at', new Date(Date.now() - 13 * 3600_000).toISOString())` to read only from the most recent computation window. Separately, add logging in the bare `catch {}` block (line 73) so failed extractions are visible in Supabase logs.

### WARNING — Should resolve before production; not blocking PM sign-off

**C-03**: Consolidate session hydration to a single call site; `ProtectedRoute` should read from the store rather than making its own `getSession` call.

**C-06**: When `hasSupabaseEnv` is true and the DB returns empty, show "No data yet — scrape pipeline not yet run" instead of falling back to mock data silently.

**C-08**: `selectedCompound` in `Library.tsx` should be `null` when `filtered.length === 0`; render "No compound matches" in the right rail.

**C-13**: Wrap `JSON.parse(text)` in `extractMentions` with try/catch; log extraction failures instead of using a bare empty `catch {}`.

**C-15**: Guard or remove the Auth page "Preview app" link when `hasSupabaseEnv` is true.

**C-16**: On delete failure in `useLog.ts`, restore the removed entry: `addLog(snapshot)` in the catch block.

**C-17**: After `signUp`, check `data.session`; if null, show "Confirm your email to continue" and do not navigate to `/app/metrics`.

**C-19**: Delete orphaned `/Users/akhularvind/peptidemaxx/src/index.css` and `src/App.css` (not imported anywhere; contain conflicting `:root` variable definitions).

---

## 6. Verdict

**Status: CRITICAL FINDINGS PRESENT**

8 critical findings remain unresolved. Master Coder must resolve all CRITICAL items before this project proceeds to the Security Auditor.

Priority order:
1. **C-11** — Table name mismatch breaks the Log feature entirely in any live deployment
2. **C-12** — Anthropic API key exposure requires architecture decision
3. **C-14** — Trend data silently corrupts over time
4. **C-05** — Trends network error causes permanent hang
5. **C-04** — Mid-session expiry leaves user on protected page
6. **C-10** — Metrics save failure is invisible to user
7. **C-02** — Unknown routes render blank page
8. **C-01** — No UI indication when Supabase env is unconfigured

Returning to Master Coder. 8 critical findings must be resolved.
