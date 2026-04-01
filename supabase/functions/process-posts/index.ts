/**
 * process-posts — Supabase Edge Function (Deno)
 *
 * Reads unprocessed social_posts and uses Claude API to extract:
 * - compound mentions (matched against known compound keys)
 * - claim type and evidence signal
 * - confidence score
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY    — Claude API key
 *   SUPABASE_URL         — injected automatically
 *   SUPABASE_SERVICE_KEY — injected automatically
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

const KNOWN_COMPOUNDS: Record<string, string[]> = {
  'bpc-157':       ['BPC-157', 'BPC157', 'BPC 157'],
  'tb-500':        ['TB-500', 'TB500', 'thymosin beta', 'thymosin beta-4'],
  'semax':         ['Semax', 'SEMAX'],
  'selank':        ['Selank', 'SELANK'],
  'ghk-cu':        ['GHK-Cu', 'GHK Cu', 'copper peptide', 'GHKCu'],
  'ipamorelin':    ['Ipamorelin', 'ipa'],
  'dihexa':        ['Dihexa', 'PNB-0408'],
  'nad-plus':      ['NAD+', 'NAD plus', 'NMN', 'NR', 'nicotinamide riboside'],
  'cjc-1295-dac':  ['CJC-1295', 'CJC1295'],
  'pt-141':        ['PT-141', 'PT141', 'Bremelanotide'],
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  // Fetch up to 50 unprocessed posts per invocation
  const { data: posts, error } = await supabase
    .from('social_posts')
    .select('id, caption, platform, source_handle, view_count')
    .eq('processed', false)
    .not('caption', 'is', null)
    .limit(50)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let processed = 0
  for (const post of posts ?? []) {
    if (!post.caption?.trim()) {
      await supabase.from('social_posts').update({ processed: true }).eq('id', post.id)
      continue
    }

    try {
      const mentions = await extractMentions(anthropic, post.caption)

      if (mentions.length > 0) {
        await supabase.from('compound_mentions').insert(
          mentions.map((m) => ({ ...m, post_id: post.id }))
        )
      }

      await supabase.from('social_posts').update({ processed: true }).eq('id', post.id)
      processed++
    } catch (err) {
      // Leave processed=false so it retries next run
      console.error(`process-posts: failed on post ${post.id}:`, err)
    }
  }

  // Recompute trend signals for active compounds
  await recomputeTrends(supabase)

  return new Response(JSON.stringify({ ok: true, processed }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

async function extractMentions(
  anthropic: Anthropic,
  caption: string
): Promise<Record<string, unknown>[]> {
  const knownList = Object.entries(KNOWN_COMPOUNDS)
    .map(([key, aliases]) => `${key}: ${aliases.join(', ')}`)
    .join('\n')

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a pharmacology extraction engine. Given a social media caption, identify any mentions of the following compounds and return structured JSON.

Known compounds:
${knownList}

Caption:
"""
${caption.slice(0, 2000)}
"""

Return a JSON array. Each element:
{
  "compound_key": "<exact key from list above, or null if not in list>",
  "compound_name": "<name as used in caption>",
  "claim_excerpt": "<exact quote from caption, max 120 chars>",
  "claim_type": "mechanism" | "dosing" | "effect" | "warning" | "anecdote" | "review",
  "evidence_signal": "cited" | "anecdotal" | "experiential" | "unknown",
  "confidence": 0.0–1.0
}

Only include compounds that are clearly mentioned. If none match, return [].
Return only the JSON array, no explanation.`,
      },
    ],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]'
  let raw: Record<string, unknown>[]
  try {
    raw = JSON.parse(text)
    if (!Array.isArray(raw)) throw new Error('Expected JSON array, got ' + typeof raw)
  } catch (err) {
    console.error('extractMentions: failed to parse Claude response:', err, 'raw text:', text.slice(0, 200))
    return []
  }
  return raw.filter((m) => m.compound_key && KNOWN_COMPOUNDS[String(m.compound_key)])
}

async function recomputeTrends(supabase: ReturnType<typeof createClient>) {
  const { data: mentions } = await supabase
    .from('compound_mentions')
    .select('compound_key, compound_name, post_id, social_posts!inner(view_count, posted_at)')
    .gte('social_posts.posted_at', new Date(Date.now() - 7 * 86400_000).toISOString())

  if (!mentions?.length) return

  const byCompound = new Map<string, { count: number; views: number; name: string }>()
  for (const m of mentions) {
    const key = m.compound_key
    const existing = byCompound.get(key) ?? { count: 0, views: 0, name: m.compound_name }
    existing.count += 1
    existing.views += Number((m as Record<string, Record<string, number>>).social_posts?.view_count ?? 0)
    byCompound.set(key, existing)
  }

  const signals = Array.from(byCompound.entries()).map(([key, val]) => ({
    compound_key: key,
    window_days: 7,
    mention_count: val.count,
    total_views: val.views,
    avg_engagement: val.count > 0 ? val.views / val.count : 0,
    computed_at: new Date().toISOString(),
  }))

  await supabase.from('trend_signals').insert(signals)
}
