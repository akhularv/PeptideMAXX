export type CompoundCategory = 'peptide' | 'nootropic' | 'compound'
export type CompoundEvidenceTier = 'clinical' | 'preclinical' | 'anecdotal'
export type CompoundDiscoveryStatus = 'established' | 'emerging' | 'watchlist'
export type CompoundSourceKind = 'paper' | 'trial' | 'regulatory' | 'social' | 'review' | 'vendor'

export interface CompoundSource {
  title: string
  url: string
  kind: CompoundSourceKind
  publishedAt?: string
  note?: string
}

export interface Compound {
  id: string
  name: string
  category: CompoundCategory
  aliases?: string[]
  tags: string[]
  accentColor: string
  summary: string
  mechanism: string
  effects: string[]
  sideEffects: string[]
  dangers: string[]
  evidenceTier: CompoundEvidenceTier
  discoveryStatus?: CompoundDiscoveryStatus
  halfLife?: string
  commonDoses?: string[]
  routes?: string[]
  synergies?: string[]
  conflicts?: string[]
  sources?: CompoundSource[]
}
