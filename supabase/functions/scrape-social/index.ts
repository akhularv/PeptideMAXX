/**
 * scrape-social — Supabase Edge Function (Deno)
 *
 * Scheduled every 12 hours via Supabase cron (pg_cron):
 *   SELECT cron.schedule('scrape-social', '0 */12 * * *',
 *     $$SELECT net.http_post(url:='https://<ref>.functions.supabase.co/scrape-social',
 *       headers:='{"Authorization":"Bearer <service_role_key>"}'::jsonb)$$);
 *
 * Flow:
 *   1. Read tracked_sources (active)
 *   2. For each source: call Apify TikTok/Instagram actor
 *   3. Upsert new posts into social_posts
 *   4. Invoke process-posts function to run Claude extraction
 *
 * Environment variables (set in Supabase dashboard):
 *   APIFY_TOKEN          — Apify API token
 *   SUPABASE_URL         — injected automatically
 *   SUPABASE_SERVICE_KEY — injected automatically
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Apify actor IDs (public, no auth needed to reference)
const APIFY_ACTORS = {
  tiktok_profile:  'clockworks~tiktok-profile-scraper',
  tiktok_hashtag:  'clockworks~tiktok-hashtag-scraper',
  instagram_profile: 'apify~instagram-profile-scraper',
  instagram_hashtag: 'apify~instagram-hashtag-scraper',
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Fetch active tracked sources
  const { data: sources, error } = await supabase
    .from('tracked_sources')
    .select('*')
    .eq('is_active', true)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results: Record<string, unknown>[] = []

  for (const source of sources ?? []) {
    try {
      const actorKey = source.type === 'account'
        ? `${source.platform}_profile`
        : `${source.platform}_hashtag`
      const actorId = APIFY_ACTORS[actorKey as keyof typeof APIFY_ACTORS]

      // Run Apify actor synchronously (waits for completion, max 120s)
      const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&maxItems=20`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            source.platform === 'tiktok'
              ? source.type === 'account'
                ? { profiles: [`https://www.tiktok.com/@${source.handle}`], resultsPerPage: 20 }
                : { hashtags: [source.handle], resultsPerPage: 20 }
              : source.type === 'account'
                ? { usernames: [source.handle], resultsType: 'posts', resultsLimit: 20 }
                : { hashtags: [source.handle], resultsType: 'posts', resultsLimit: 20 }
          ),
          signal: AbortSignal.timeout(90_000),
        }
      )

      if (!apifyRes.ok) {
        results.push({ source: source.handle, error: `Apify ${apifyRes.status}` })
        continue
      }

      const items: Record<string, unknown>[] = await apifyRes.json()

      // Normalise and upsert
      const posts = items.map((item) => normalisePost(item, source))
      if (posts.length > 0) {
        await supabase.from('social_posts').upsert(posts, {
          onConflict: 'platform,external_id',
          ignoreDuplicates: true,
        })
      }

      results.push({ source: source.handle, scraped: posts.length })
    } catch (err) {
      results.push({ source: source.handle, error: String(err) })
    }
  }

  // Trigger Claude processing for unprocessed posts
  await supabase.functions.invoke('process-posts')

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

function normalisePost(
  item: Record<string, unknown>,
  source: { platform: string; handle: string }
): Record<string, unknown> {
  if (source.platform === 'tiktok') {
    return {
      platform: 'tiktok',
      external_id: String(item.id ?? item.videoId ?? ''),
      source_handle: source.handle,
      caption: String(item.text ?? item.desc ?? ''),
      hashtags: extractHashtags(String(item.text ?? '')),
      view_count: Number(item.playCount ?? item.stats?.playCount ?? 0),
      like_count: Number(item.diggCount ?? item.stats?.diggCount ?? 0),
      comment_count: Number(item.commentCount ?? item.stats?.commentCount ?? 0),
      share_count: Number(item.shareCount ?? item.stats?.shareCount ?? 0),
      video_url: String(item.webVideoUrl ?? item.url ?? ''),
      thumbnail_url: String(item.covers?.[0] ?? item.video?.cover ?? ''),
      posted_at: item.createTime
        ? new Date(Number(item.createTime) * 1000).toISOString()
        : null,
    }
  } else {
    return {
      platform: 'instagram',
      external_id: String(item.id ?? item.shortCode ?? ''),
      source_handle: source.handle,
      caption: String(item.caption ?? item.text ?? ''),
      hashtags: extractHashtags(String(item.caption ?? '')),
      view_count: Number(item.videoViewCount ?? item.videoPlayCount ?? 0),
      like_count: Number(item.likesCount ?? item.likes ?? 0),
      comment_count: Number(item.commentsCount ?? item.comments ?? 0),
      share_count: 0,
      video_url: String(item.url ?? item.videoUrl ?? ''),
      thumbnail_url: String(item.displayUrl ?? item.thumbnailUrl ?? ''),
      posted_at: item.timestamp
        ? new Date(String(item.timestamp)).toISOString()
        : null,
    }
  }
}

function extractHashtags(text: string): string[] {
  return (text.match(/#[\w]+/g) ?? []).map((t) => t.slice(1).toLowerCase())
}
