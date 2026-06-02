import { storageClient } from '../client'
import { STORES } from '../schema'
import { createRepository } from './base'
import type { Citation, Evidence, ResearchMeta, TrustedSource, WatchlistCompany } from '../../types'

export interface SettingEntry {
  key: string
  value: unknown
}

export const companiesRepo = createRepository<WatchlistCompany>(storageClient, STORES.companies)
export const evidenceRepo = createRepository<Evidence>(storageClient, STORES.evidence)
export const citationsRepo = createRepository<Citation>(storageClient, STORES.citations)
export const trustedSourcesRepo = createRepository<TrustedSource>(
  storageClient,
  STORES.trusted_sources,
)
export const researchMetaRepo = {
  async get(companyId: string): Promise<ResearchMeta | undefined> {
    return storageClient.get<ResearchMeta>(STORES.research_meta, companyId)
  },
  async put(meta: ResearchMeta): Promise<string> {
    return storageClient.put(STORES.research_meta, meta)
  },
}

export const settingsRepo = {
  async get(key: string): Promise<SettingEntry | undefined> {
    return storageClient.get<SettingEntry>(STORES.settings, key)
  },
  async put(entry: SettingEntry): Promise<string> {
    return storageClient.put(STORES.settings, entry)
  },
}
