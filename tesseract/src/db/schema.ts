export const DB_NAME = 'tesseract-db'
export const DB_VERSION = 5

export const STORES = {
  companies: 'companies',
  settings: 'settings',
  evidence: 'evidence',
  citations: 'citations',
  trusted_sources: 'trusted_sources',
  research_meta: 'research_meta',
} as const

export type StoreName = (typeof STORES)[keyof typeof STORES]
export type IndexedStoreName = Exclude<StoreName, 'settings'>
