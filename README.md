# PeptideMaxx.AI

Compound intelligence system for peptide, nootropic, and performance compound research, logging, and AI-guided stack building.

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase credentials
4. Run the Supabase schema SQL in the Supabase SQL editor (file: `supabase/schema.sql`)
5. `npm run dev`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key — **backend proxy only**, never expose in frontend |

## Wiring the Chatbot (Dr. Voss)

The chat UI is fully built. To connect real AI responses:

1. **Create a backend proxy endpoint** `POST /api/chat`
   - Options: Next.js API route, Express server, or Supabase Edge Function
2. **Request shape** the endpoint receives:
   ```ts
   { messages: { role: 'user' | 'assistant', content: string }[], userContext?: object }
   ```
3. **Call the Anthropic API** with the `DR_VOSS_SYSTEM_PROMPT` from `src/lib/api.ts`:
   ```ts
   import Anthropic from '@anthropic-ai/sdk'
   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
   const response = await client.messages.create({
     model: 'claude-sonnet-4-20250514',
     max_tokens: 1500,
     system: DR_VOSS_SYSTEM_PROMPT,
     messages: req.body.messages,
   })
   ```
4. **Replace the stub** in `src/lib/api.ts` → `sendChatMessage()` with a real `fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages, userContext }) })`

> Note: The current stub returns a realistic placeholder response after a 1.2s delay so the UI is fully functional for development.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 8 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | Framer Motion 12 + Three.js r183 |
| Backend/Auth | Supabase (Postgres + Auth + RLS) |
| Routing | React Router v7 |
| State | Zustand v5 |
| Icons | Lucide React |

## Project Structure

```
src/
  components/
    ui/           # Button, Badge, Card, Input, Textarea, Skeleton
    layout/       # Sidebar, PageShell, ProtectedRoute
    library/      # CompoundCard
    landing/      # MolecularBackground (Three.js)
  hooks/          # useAuth, useLog, useMetrics, useChat, useCompounds
  lib/            # supabase.ts, compounds.ts, api.ts, logger.ts
  pages/          # Landing, Auth, Dashboard, Library, Chat, Log, Metrics
  store/          # useAppStore, useUserStore
  types/          # compound.ts, log.ts, user.ts
  styles/         # index.css (Tailwind v4 @theme tokens)
supabase/
  schema.sql      # Run this in Supabase SQL editor
```

## Compound Library

10 compounds with pharmacologically accurate data:

| Compound | Category | Evidence |
|----------|----------|----------|
| BPC-157 | Peptide | Preclinical |
| TB-500 | Peptide | Clinical |
| Semax | Nootropic | Clinical |
| Selank | Nootropic | Clinical |
| GHK-Cu | Peptide | Preclinical |
| Ipamorelin | Peptide | Preclinical |
| Dihexa | Nootropic | Anecdotal |
| NAD+ | Compound | Clinical |
| CJC-1295 | Peptide | Preclinical |
| PT-141 | Peptide | Clinical (FDA approved) |
