# System Specification — PeptideMaxx Social Intelligence Pipeline

Version: 1  |  Date: 2026-03-30  |  Changed: Initial draft

---

## 1. Problem Statement

PeptideMaxx.AI needs a data feed that automatically collects social media posts about peptides, nootropics, and biohacking from TikTok and Instagram, extracts structured information from those posts using an AI model (compound names, dosing claims, evidence quality), persists the results in the existing Supabase backend, and surfaces a curated "Trends" feed page inside the authenticated app experience. The entire processing pipeline must run serverlessly on a scheduled basis with no persistent server to operate.

---

## 2. System Overview

```
  EXTERNAL SOURCES
  ┌─────────────────┐   ┌─────────────────┐
  │  TikTok Research │   │  Apify Actor    │
  │  API (official)  │   │  (Instagram/TT  │
  │  [OPEN DECISION] │   │   fallback)     │
  └────────┬────────┘   └────────┬────────┘
           │                     │
           └──────────┬──────────┘
                      │  raw post metadata (JSON)
                      ▼
  ┌──────────────────────────────────────────┐
  │  SCRAPER EDGE FUNCTION                   │
  │  supabase/functions/scrape-social/       │
  │  Deno runtime, Supabase cron trigger     │
  │  Writes raw rows → social_posts          │
  │  Status: scraped, pending_processing     │
  └──────────────────┬───────────────────────┘
                     │  social_posts rows (status=scraped)
                     ▼
  ┌──────────────────────────────────────────┐
  │  PROCESSOR EDGE FUNCTION                 │
  │  supabase/functions/process-posts/       │
  │  Deno runtime, Supabase cron trigger     │
  │  Reads pending rows from social_posts    │
  │  Calls Claude API → extracts compounds,  │
  │  claims, dosing, evidence signal         │
  │  Writes → compound_mentions              │
  │  Writes → trend_signals                  │
  │  Updates social_posts.status → done      │
  └──────────────────┬───────────────────────┘
                     │  structured data
                     ▼
  ┌──────────────────────────────────────────┐
  │  SUPABASE POSTGRES                       │
  │  Tables:                                 │
  │    tracked_accounts                      │
  │    tracked_hashtags                      │
  │    social_posts                          │
  │    compound_mentions                     │
  │    trend_signals                         │
  │  RLS: anon read on public trend data     │
  │  RLS: service_role write from functions  │
  └──────────────────┬───────────────────────┘
                     │  Supabase JS client queries
                     ▼
  ┌──────────────────────────────────────────┐
  │  REACT FRONTEND — /app/trends            │
  │  useTrends() hook                        │
  │  TrendsPage component                    │
  │  PostCard component                      │
  │  CompoundTag component                   │
  │  EvidenceBadge component                 │
  └──────────────────────────────────────────┘
```

---

## 3. Module Inventory

### Module 1: scrape-social (Supabase Edge Function)

**Purpose**: Poll configured accounts and hashtags; collect raw post metadata; write deduped rows into `social_posts`.

**Inputs**:
- `tracked_accounts` table rows (platform, handle, last_scraped_at)
- `tracked_hashtags` table rows (platform, hashtag, last_scraped_at)
- Platform API credentials (env vars: `TIKTOK_API_TOKEN`, `APIFY_API_KEY`)

**Outputs**:
- New rows in `social_posts` with `status = 'scraped'`
- Updated `last_scraped_at` on `tracked_accounts` / `tracked_hashtags`

**Dependencies**:
- Supabase Postgres (service_role client)
- TikTok Research API OR Apify Actor HTTP endpoint
- Supabase pg_cron or Supabase scheduled invocations

**Trigger**: Cron schedule, every 6–24 hours (configurable via env var `SCRAPE_INTERVAL_HOURS`)

**Idempotency constraint**: Must check `social_posts.platform_post_id` for uniqueness before insert. Duplicate platform_post_id must be silently skipped (not errored).

---

### Module 2: process-posts (Supabase Edge Function)

**Purpose**: Read all `social_posts` rows with `status = 'scraped'`; call Claude API to extract structured signals; write `compound_mentions` and `trend_signals`; mark posts `done`.

**Inputs**:
- `social_posts` rows where `status = 'scraped'` (caption, hashtags, platform, view_count)
- `ANTHROPIC_API_KEY` (env var)
- `CLAUDE_MODEL` (env var, defaults to `claude-3-5-haiku-20241022`)
- Known compound name list injected into system prompt (derived from compound library)

**Outputs**:
- Rows in `compound_mentions` (one per compound mention per post)
- Rows in `trend_signals` (one per post, aggregated signal)
- `social_posts.status` updated to `'done'` or `'error'`
- `social_posts.processed_at` timestamp set

**Dependencies**:
- Supabase Postgres (service_role client)
- Anthropic Messages API (`https://api.anthropic.com/v1/messages`)
- Module 1 output (social_posts)

**Trigger**: Cron schedule, runs after scraper (offset by 5 minutes), or can be triggered via Supabase Database Webhook on `social_posts` insert

**Batch constraint**: Process at most `PROCESS_BATCH_SIZE` (default 20) posts per invocation to stay within Deno Edge Function 150-second wall-clock timeout.

---

### Module 3: Supabase Postgres Schema (Storage Layer)

**Purpose**: Single source of truth for all scraped and processed data.

**Inputs**: Written by Edge Functions (service_role). Read by frontend (anon, RLS-gated).

**Outputs**: Query results served to React frontend via Supabase JS client.

**Dependencies**: Supabase hosted Postgres; RLS policies.

Tables: `tracked_accounts`, `tracked_hashtags`, `social_posts`, `compound_mentions`, `trend_signals` — see Section 3a below.

#### Section 3a: Table Definitions (authoritative schema)

```sql
-- Accounts and hashtags to monitor
CREATE TABLE tracked_accounts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform     text NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  handle       text NOT NULL,
  display_name text,
  is_active    boolean NOT NULL DEFAULT true,
  last_scraped_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, handle)
);

CREATE TABLE tracked_hashtags (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform     text NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  hashtag      text NOT NULL,   -- stored without '#' prefix
  is_active    boolean NOT NULL DEFAULT true,
  last_scraped_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, hashtag)
);

-- Raw scraped posts (one row per post per scrape source)
CREATE TABLE social_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform         text NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  platform_post_id text NOT NULL,          -- native post ID from the platform
  source_type      text NOT NULL CHECK (source_type IN ('account', 'hashtag')),
  source_ref       text NOT NULL,          -- handle or hashtag that triggered the scrape
  creator_handle   text,
  creator_id       text,                   -- platform-native creator ID
  caption          text,
  hashtags         text[],                 -- array of hashtag strings (without '#')
  view_count       bigint,
  like_count       bigint,
  comment_count    bigint,
  share_count      bigint,
  post_url         text,
  thumbnail_url    text,
  posted_at        timestamptz,            -- when the post was published on the platform
  scraped_at       timestamptz NOT NULL DEFAULT now(),
  status           text NOT NULL DEFAULT 'scraped'
                     CHECK (status IN ('scraped', 'processing', 'done', 'error')),
  processed_at     timestamptz,
  error_message    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, platform_post_id)
);

-- One row per compound mention per post (multiple per post allowed)
CREATE TABLE compound_mentions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  compound_id     text,                    -- matches compounds.ts id slug (e.g. 'bpc-157')
                                           -- NULL if Claude identifies a compound not in library
  compound_name   text NOT NULL,           -- raw name as Claude extracted it
  claim_text      text,                    -- verbatim excerpt from caption supporting the claim
  dose_mentioned  text,                    -- e.g. '500 mcg/day' or NULL
  route_mentioned text,                    -- e.g. 'SubQ', 'oral', or NULL
  evidence_signal text NOT NULL CHECK (evidence_signal IN ('anecdotal', 'cited', 'unclear')),
  confidence      numeric(4,3) CHECK (confidence BETWEEN 0 AND 1),  -- Claude's self-reported confidence
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- One row per post: rolled-up trend signal for the feed
CREATE TABLE trend_signals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             uuid NOT NULL UNIQUE REFERENCES social_posts(id) ON DELETE CASCADE,
  compound_ids        text[],              -- array of matched compound_id slugs
  primary_compound_id text,               -- highest-confidence single compound, or NULL
  overall_evidence    text NOT NULL CHECK (overall_evidence IN ('anecdotal', 'cited', 'mixed', 'unclear')),
  danger_flag         boolean NOT NULL DEFAULT false,  -- true if Claude flagged a safety concern
  danger_note         text,               -- brief note if danger_flag is true
  summary_blurb       text,               -- 1–2 sentence Claude-generated summary for feed card
  created_at          timestamptz NOT NULL DEFAULT now()
);
```

**Indexes required** (for feed query performance):
```sql
CREATE INDEX ON social_posts (status, scraped_at);
CREATE INDEX ON social_posts (platform, posted_at DESC);
CREATE INDEX ON compound_mentions (compound_id);
CREATE INDEX ON compound_mentions (post_id);
CREATE INDEX ON trend_signals (primary_compound_id);
CREATE INDEX ON trend_signals (created_at DESC);
```

**RLS policies** (minimum required):
- `social_posts`: authenticated users SELECT; service_role full access
- `compound_mentions`: authenticated users SELECT; service_role full access
- `trend_signals`: authenticated users SELECT; service_role full access
- `tracked_accounts` / `tracked_hashtags`: service_role full access; no direct user access

---

### Module 4: useTrends (React hook)

**Purpose**: Fetch paginated, enriched trend data from Supabase for display in the Trends page. Joins `trend_signals`, `social_posts`, and `compound_mentions` at the query layer.

**Inputs**:
- Supabase JS client (existing `src/lib/supabase.ts`)
- Filter params: `compoundId?: string`, `platform?: 'tiktok' | 'instagram'`, `evidenceFilter?: string`, `pageSize: number`

**Outputs**:
- `TrendFeedItem[]` (see Interface Contracts)
- `isLoading: boolean`, `error: string | null`, `hasMore: boolean`, `loadMore: () => void`

**Dependencies**: `@supabase/supabase-js ^2.100.0` (already in package.json)

---

### Module 5: TrendsPage + Components (React)

**Purpose**: Render the `/app/trends` route within the existing Dashboard shell. Display the social intelligence feed using the app's existing design system.

**Route**: `/app/trends` — added to `App.tsx` as a lazy-loaded route within the existing `ProtectedRoute` / `Dashboard` shell.

**Sub-components**:
- `TrendsPage` — page-level container; holds filter state; renders feed
- `PostCard` — single post card in the feed
- `CompoundTag` — pill showing compound name + evidence badge
- `EvidenceBadge` — color-coded pill: `anecdotal` (--accent-warm), `cited` (--accent), `mixed` (--accent-cool), `unclear` (--muted)
- `DangerFlag` — red warning chip using `--danger` token

**Dependencies**: Existing design tokens (`src/styles/index.css`), `useTrends` hook, existing `Badge`, `Skeleton`, `Button` UI components.

---

## 4. Technology Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Frontend framework | React | ^19.2.4 (existing) |
| Frontend language | TypeScript | ~5.9.3, strict mode (existing) |
| Frontend bundler | Vite | ^8.0.1 (existing) |
| Backend / DB | Supabase Postgres | hosted (existing project) |
| Auth | Supabase Auth | existing |
| Edge Functions runtime | Deno | Supabase-managed (no version pin — managed by Supabase) |
| Scheduler | Supabase pg_cron | enabled via Supabase dashboard |
| AI processing | Anthropic Messages API | claude-3-5-haiku-20241022 (matches existing DR_VOSS_SYSTEM_PROMPT) |
| Social data — primary | TikTok Research API | v2 (academic/developer program) [OPEN DECISION] |
| Social data — fallback | Apify | Actors: `clockworks/tiktok-scraper`, `apify/instagram-reel-scraper`; free tier has rate limits |
| Supabase JS client | @supabase/supabase-js | ^2.100.0 (existing) |
| State management | Zustand | ^5.0.12 (existing) |
| Component animation | Framer Motion | ^12.38.0 (existing) |

No new npm dependencies are required for the frontend Trends page. The Edge Functions have no npm — they use Deno's native `fetch` and `Deno.env`.

---

## 5. Scalability Constraints

**Data scale**: Target accounts: ~20–50 creator accounts + ~10–20 hashtags. Expected post volume: 50–200 new posts per scrape cycle. Monthly row accumulation: ~5,000–30,000 `social_posts` rows, ~15,000–90,000 `compound_mentions` rows. Supabase free tier Postgres limit (500 MB) will be reached within ~12 months at upper bound; plan for archival or upgrade.

**Latency budget**: Trends feed initial load target: <2 seconds. Supabase query with index should return first page (20 rows) in <200ms. `useTrends` should prefetch next page on scroll approach.

**Edge Function wall-clock limit**: 150 seconds per Supabase Edge Function invocation. The processor must cap its batch at `PROCESS_BATCH_SIZE` (default 20 posts × ~3s Claude latency = ~60s). Do not attempt to drain all pending posts in a single invocation.

**Memory ceiling**: Edge Functions have a 512 MB memory limit. Caption text is small; no concern at batch size 20.

**Claude API cost**: At haiku pricing (~$0.80 / 1M input tokens), processing 20 posts × ~500 tokens each = ~10,000 tokens ≈ $0.008 per batch invocation. Daily cost at 4 invocations/day ≈ $0.03/day. Acceptable.

**Rate limits**: TikTok Research API has per-day request quotas (varies by approval tier) — [OPEN DECISION]. Apify free tier: 30 actor compute units/month. Quota exhaustion must be surfaced as `error_message` on the tracking table row, not a silent skip.

---

## 6. Coupling Risk Register

### Risk CR-01: Claude output schema brittleness
**Coupling**: The `process-posts` function parses a JSON object from Claude's text response. If Claude outputs malformed JSON, all downstream `compound_mentions` and `trend_signals` rows for that post are lost.
**Mitigation**: The prompt must request a JSON block delimited by triple-backtick fences with a well-defined schema (field names specified exactly). The processor must wrap JSON.parse in try/catch and set `status = 'error'` with `error_message` containing the raw Claude response on parse failure. Never silently drop.

### Risk CR-02: `compound_id` foreign key looseness
**Coupling**: `compound_mentions.compound_id` is a `text` slug matching `compounds.ts` IDs. The Postgres column has no FK into a `compounds` table (the compound library is static TypeScript, not a Postgres table). If a compound is renamed or added in `compounds.ts` but the slug list in the processor prompt is not updated, the join in the frontend `useTrends` hook will return NULL.
**Mitigation**: [OPEN DECISION] — decide whether to materialize the compound library into a Postgres `compounds` table with a real FK, or document the soft-link and accept NULLs gracefully in the frontend. If soft-link approach is kept, `compound_id = NULL` must be a valid display state (show `compound_name` raw text instead).

### Risk CR-03: Apify actor versioning
**Coupling**: Apify actor APIs are third-party and can change output schemas or rate limits without notice. The scraper module depends on specific output field names from actor run results.
**Mitigation**: The scraper must map Apify output fields to the internal `social_posts` schema in a single, isolated transformation function. All field-mapping logic lives in one place. If a required field is absent, the row is written with `NULL` for that field — not dropped.

### Risk CR-04: Duplicate processing on Edge Function retry
**Coupling**: Supabase cron invocations can overlap if a previous run is still executing. Two concurrent `process-posts` invocations could both read the same `status = 'scraped'` rows and double-process them.
**Mitigation**: The processor must use an atomic status transition: `UPDATE social_posts SET status = 'processing' WHERE status = 'scraped' RETURNING id` as the first operation (Postgres-level lock via UPDATE returning). Process only rows whose IDs were returned by this UPDATE. This prevents race conditions without an explicit advisory lock.

### Risk CR-05: API key exposure in Edge Function env vars
**Coupling**: `ANTHROPIC_API_KEY`, `TIKTOK_API_TOKEN`, and `APIFY_API_KEY` are stored in Supabase Edge Function secrets. If `scrape-social` is called via a public HTTP endpoint (not cron-only), the function could be invoked arbitrarily.
**Mitigation**: Both Edge Functions must reject invocations that do not carry the `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` header, OR be deployed as internal-only functions (no public HTTP route). See Security Auditor to verify.

### Risk CR-06: Frontend React 19 + existing lazy-load pattern
**Coupling**: App.tsx uses React.lazy for Metrics. The Trends page must follow the same pattern to avoid increasing the initial bundle. If Trends imports recharts or Three.js transitively, the bundle split benefit is lost.
**Mitigation**: `TrendsPage` must not import recharts, Three.js, or any other large library not already code-split. It uses only the Supabase client and existing UI primitives.

### Risk CR-07: RLS policy gap on trend data
**Coupling**: Trend feed data is based on scraped social posts, not user-owned data. If RLS is misconfigured to require `auth.uid() = user_id` (a pattern copied from `log_entries`), the Trends feed will silently return zero rows for all users.
**Mitigation**: `trend_signals`, `social_posts`, `compound_mentions` are global/shared data tables. Their SELECT RLS policy must be `USING (true)` for all authenticated users, not scoped to `user_id`. This must be verified at schema migration time.

---

## 7. Open Decisions

### [OPEN DECISION 1] TikTok Research API eligibility
The TikTok Research API (v2) requires an approved developer application. Approval is not guaranteed and takes 1–4 weeks. The architecture designates it as the primary source, with Apify as fallback. **Human sign-off needed**: confirm whether a TikTok Research API application has been submitted or if Apify should be the sole source initially.

### [OPEN DECISION 2] Instagram data source
Instagram has no official public API for Reels metadata without a business account and Meta app review. Apify's `apify/instagram-reel-scraper` actor is the most practical option but technically violates Instagram ToS (as does all third-party scraping). **Human sign-off needed**: decide whether to include Instagram or launch TikTok-only, and confirm acceptable risk posture on ToS compliance.

### [OPEN DECISION 3] Compound library in Postgres vs TypeScript
Currently `compounds.ts` is the source of truth for compound IDs and metadata. `compound_mentions.compound_id` is a soft text link. If the compound library grows or needs admin management, materializing it as a Postgres table with a real FK is cleaner. **Human sign-off needed**: keep soft-link (simple, no migration) or create a `compounds` Postgres table (adds migration, unlocks FK integrity).

### [OPEN DECISION 4] Supabase cron vs Database Webhook trigger for processor
Two options: (A) Run `process-posts` on a fixed cron offset after `scrape-social`; (B) Use a Supabase Database Webhook on `social_posts` INSERT to trigger `process-posts` per-row. Option A is simpler and respects batch size. Option B is near-real-time but risks parallel invocations and higher Claude API call fragmentation. **Human sign-off needed on preferred scheduling model.**

### [OPEN DECISION 5] Public vs authenticated-only Trends feed
The current `/app/trends` route is behind `ProtectedRoute`. The trend data is not user-private. **Human sign-off needed**: should the Trends feed be accessible without login (add a public route), or remain auth-gated as designed?

### [OPEN DECISION 6] Apify free tier quota adequacy
Apify free tier provides 30 actor compute units/month. At ~15 minutes of compute per run and 4 runs/day, monthly usage is ~30 hours, which far exceeds the free tier. **Human sign-off needed**: confirm Apify paid tier budget OR constrain scrape frequency to stay within free tier.
