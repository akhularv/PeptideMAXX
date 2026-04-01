-- Social Intelligence Pipeline Schema
-- Run in Supabase SQL editor after the base schema

-- Tracked accounts and hashtags
CREATE TABLE IF NOT EXISTS tracked_sources (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN ('account', 'hashtag')),
  platform     text NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  handle       text NOT NULL,           -- @handle or #hashtag (no prefix stored)
  display_name text,
  follower_est integer,
  focus_tags   text[],                  -- e.g. ['peptides','longevity']
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Raw scraped posts
CREATE TABLE IF NOT EXISTS social_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        text NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  external_id     text NOT NULL,         -- platform's native video/post ID
  source_handle   text NOT NULL,
  caption         text,
  hashtags        text[],
  view_count      bigint,
  like_count      bigint,
  comment_count   bigint,
  share_count     bigint,
  video_url       text,
  thumbnail_url   text,
  posted_at       timestamptz,
  scraped_at      timestamptz NOT NULL DEFAULT now(),
  processed       boolean NOT NULL DEFAULT false,
  UNIQUE (platform, external_id)
);

-- Claude-extracted compound mentions per post
CREATE TABLE IF NOT EXISTS compound_mentions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  compound_key    text NOT NULL,          -- matches compounds.ts id field
  compound_name   text NOT NULL,
  claim_excerpt   text,                   -- exact text from caption supporting the mention
  claim_type      text CHECK (claim_type IN ('mechanism','dosing','effect','warning','anecdote','review')),
  evidence_signal text CHECK (evidence_signal IN ('cited','anecdotal','experiential','unknown')),
  confidence      real CHECK (confidence BETWEEN 0 AND 1),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Aggregated trend signals (materialised by Edge Function)
CREATE TABLE IF NOT EXISTS trend_signals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compound_key     text NOT NULL,
  window_days      integer NOT NULL DEFAULT 7,
  mention_count    integer NOT NULL DEFAULT 0,
  total_views      bigint NOT NULL DEFAULT 0,
  avg_engagement   real,
  trending_up      boolean,               -- true if count > previous window
  computed_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS social_posts_posted_at      ON social_posts (posted_at DESC);
CREATE INDEX IF NOT EXISTS social_posts_platform       ON social_posts (platform);
CREATE INDEX IF NOT EXISTS social_posts_processed      ON social_posts (processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS compound_mentions_compound  ON compound_mentions (compound_key);
CREATE INDEX IF NOT EXISTS compound_mentions_post      ON compound_mentions (post_id);
CREATE INDEX IF NOT EXISTS trend_signals_compound      ON trend_signals (compound_key, computed_at DESC);

-- Seed tracked sources
INSERT INTO tracked_sources (type, platform, handle, display_name, follower_est, focus_tags) VALUES
-- TikTok accounts
('account','tiktok','drbradnabers',       'Dr. Brad Nabers',          180000, ARRAY['peptides','biohacking']),
('account','tiktok','jay_campbell_tt',    'Jay Campbell',             95000,  ARRAY['peptides','trt','longevity']),
('account','tiktok','peptide.doc',        'Peptide Doc',              220000, ARRAY['peptides','clinical']),
('account','tiktok','thebiohackingdoc',   'The Biohacking Doc',       310000, ARRAY['biohacking','nootropics','longevity']),
('account','tiktok','stackingprotocols',  'Stacking Protocols',       145000, ARRAY['peptides','stacks']),
('account','tiktok','nootrostack',        'NootroStack',              88000,  ARRAY['nootropics','cognitive']),
('account','tiktok','longevitylab_',      'Longevity Lab',            260000, ARRAY['longevity','nad','peptides']),
('account','tiktok','biohacker.josh',     'Josh Biohacker',           74000,  ARRAY['biohacking','nootropics']),
-- Instagram accounts
('account','instagram','jay_campbell_official','Jay Campbell',         185000, ARRAY['peptides','trt','longevity']),
('account','instagram','drbradnabers',    'Dr. Brad Nabers',          92000,  ARRAY['peptides','biohacking']),
('account','instagram','thebiohackingdoc','The Biohacking Doc',       198000, ARRAY['biohacking','longevity']),
('account','instagram','peptide.pro',     'Peptide Pro',              137000, ARRAY['peptides','clinical']),
('account','instagram','optimizedlife.official','Optimized Life',     210000, ARRAY['biohacking','performance']),
('account','instagram','nataliejoybio',   'Natalie Joy',              89000,  ARRAY['nootropics','womenshealth']),
-- TikTok hashtags
('hashtag','tiktok','BPC157',    NULL, NULL, ARRAY['peptides']),
('hashtag','tiktok','TB500',     NULL, NULL, ARRAY['peptides']),
('hashtag','tiktok','peptides',  NULL, NULL, ARRAY['peptides']),
('hashtag','tiktok','nootropics',NULL, NULL, ARRAY['cognitive']),
('hashtag','tiktok','biohacking',NULL, NULL, ARRAY['biohacking']),
('hashtag','tiktok','longevity', NULL, NULL, ARRAY['longevity']),
('hashtag','tiktok','peptidetherapy',NULL,NULL,ARRAY['peptides','clinical']),
('hashtag','tiktok','GHKCu',     NULL, NULL, ARRAY['peptides']),
('hashtag','tiktok','semax',     NULL, NULL, ARRAY['nootropics']),
('hashtag','tiktok','selank',    NULL, NULL, ARRAY['nootropics']),
('hashtag','tiktok','PT141',     NULL, NULL, ARRAY['peptides']),
('hashtag','tiktok','ipamorelin',NULL, NULL, ARRAY['peptides']),
-- Instagram hashtags
('hashtag','instagram','peptides',       NULL, NULL, ARRAY['peptides']),
('hashtag','instagram','biohacking',     NULL, NULL, ARRAY['biohacking']),
('hashtag','instagram','nootropics',     NULL, NULL, ARRAY['cognitive']),
('hashtag','instagram','peptidetherapy', NULL, NULL, ARRAY['peptides','clinical']),
('hashtag','instagram','BPC157',         NULL, NULL, ARRAY['peptides']),
('hashtag','instagram','longevity',      NULL, NULL, ARRAY['longevity'])
ON CONFLICT DO NOTHING;
