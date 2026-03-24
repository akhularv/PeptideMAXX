# RESEARCH_BRIEF.md

## Scope

Design a safe expansion path for PeptideMaxx from a small hand-curated peptide library into a larger market-intelligence system that combines:

- primary literature and trials
- regulatory and clinical references
- compliant social/market signals

## Current app state

- The product currently ships with a static in-app library of 10 compounds.
- There is no ingest pipeline yet for papers, trials, or social signals.
- Compound records currently favor descriptive pharmacology, not provenance-heavy source tracking.

## Recommendation

Use a three-lane evidence model:

1. `Evidence lane`
   Ingest PubMed/NCBI, Europe PMC, Crossref, and ClinicalTrials.gov. These should drive the scientific and safety view.

2. `Market-signal lane`
   Ingest only compliant public or permissioned social data. Treat this as discovery and hypothesis generation, not proof.

3. `Curation lane`
   Run claim extraction, duplicate merging, source scoring, and human review before any new peptide becomes visible in the main atlas.

## Source strategy

### Papers and trials

- `PubMed / NCBI`
  Use E-utilities or Entrez-based retrieval for abstracts, identifiers, MeSH terms, and linked records.
- `Europe PMC`
  Use it for broader life-science coverage, annotations, and open-access full-text reach.
- `ClinicalTrials.gov`
  Use it for intervention status, phase, recruitment state, and protocol metadata.
- `Crossref`
  Use it for DOI normalization, references, and metadata repair.

These sources should be considered the canonical evidence backbone.

### TikTok

What is clearly available from official developer surfaces:

- TikTok `Content Posting API`
  Designed for publishing/upload workflows, not broad public-content scraping.
- TikTok `Commercial Content API`
  Provides research/transparency access to ad and advertiser metadata in the Commercial Content Library.

Inference from the current official surfaces:

- I did **not** find an official broad-purpose public Reels-style scraping API for general creator video harvesting.
- That means a compliant TikTok lane should rely on:
  - approved developer/research products if your org is eligible
  - explicit creator opt-in or owned-account access
  - ad/transparency datasets where relevant
  - manual analyst review for high-signal discoveries

### Instagram / Meta

Current practical constraint:

- Instagram Graph API is suitable for owned or authorized professional-account workflows, publishing, and business analytics.
- Broader public-content research access is much more restricted and appears to flow through Meta research tools such as the `Content Library` / related research access programs, not open commercial scraping.

Operational consequence:

- Do **not** build this around direct scraping of Instagram Reels.
- Build it around:
  - authorized account access
  - approved research-tool access where eligible
  - analyst-submitted URLs and manual review
  - third-party providers only after legal review and policy confirmation

## Product architecture

### 1. Canonical peptide registry

Each peptide should have:

- canonical name
- aliases and product/market synonyms
- category
- evidence tier
- discovery status (`established`, `emerging`, `watchlist`)
- mechanism summary
- safety summary
- structured source list

### 2. Claim ledger

Every incoming paper, trial, or social mention becomes a normalized claim:

- `entity`
- `claim`
- `source_type`
- `source_url`
- `published_at`
- `confidence`
- `needs_review`

This prevents social chatter from directly mutating the canonical compound record.

### 3. Scoring

Maintain separate scores for:

- evidence strength
- safety concern level
- market velocity
- novelty / emergence
- source diversity

The UI can then show both `scientific confidence` and `market buzz` without conflating them.

### 4. Human review gate

Require review before promoting a new peptide from watchlist into the public library.

Suggested promotion rule:

- at least one high-trust scientific source **or**
- multiple independent market-signal hits plus explicit analyst review

## What to avoid

- Direct scraping of TikTok or Instagram Reels without platform approval.
- Treating social claims as evidence.
- Vendor catalogs as the primary canonical source.
- Letting the LLM invent peptide entries from weak mentions.

## Recommended near-term implementation

### Phase 1

- Expand the compound schema to support aliases, provenance, and discovery status.
- Move the compound registry out of a single static file into a source-backed data store.
- Build paper/trial ingestion first.

### Phase 2

- Add a `watchlist` table for emerging peptides and product names.
- Add analyst submission for TikTok/Instagram URLs.
- Add claim extraction and source scoring.

### Phase 3

- Add approved social/research connectors where legal/policy access exists.
- Surface `market signals` as a separate rail in the UI.

## Sources

- TikTok Content Posting API: https://developers.tiktok.com/products/content-posting-api
- TikTok Commercial Content API: https://developers.tiktok.com/products/commercial-content-api
- Meta research-tool access context (reported replacement for CrowdTangle with Content Library/API): https://www.axios.com/2024/03/19/meta-shut-off-data-access-to-journalists
- Europe PMC overview / API ecosystem context: https://docs.ropensci.org/europepmc/

## Bottom line

Yes, papers and social media both matter for peptide intelligence, but they should play different roles:

- papers/trials answer `what is supported`
- social media answers `what is emerging`

PeptideMaxx should ingest both, but only through a provenance-first and policy-compliant pipeline.
