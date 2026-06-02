import { storageClient } from './client'
import { STORES } from './schema'
import {
  citationsRepo,
  companiesRepo,
  evidenceRepo,
  researchMetaRepo,
  settingsRepo,
  trustedSourcesRepo,
} from './repositories'
import { seedDatabaseIfNeeded } from './seed'

export { storageClient, getDb } from './client'
export {
  companiesRepo,
  evidenceRepo,
  citationsRepo,
  trustedSourcesRepo,
  researchMetaRepo,
  settingsRepo,
} from './repositories'
export { seedDatabaseIfNeeded, SEED_COMPANY } from './seed'

export async function initDatabase(): Promise<void> {
  await seedDatabaseIfNeeded()
}

export interface DatabaseExport {
  version: number
  exportedAt: string
  companies: Awaited<ReturnType<typeof companiesRepo.getAll>>
  evidence: Awaited<ReturnType<typeof evidenceRepo.getAll>>
  citations: Awaited<ReturnType<typeof citationsRepo.getAll>>
  trusted_sources: Awaited<ReturnType<typeof trustedSourcesRepo.getAll>>
  research_meta: Awaited<ReturnType<typeof storageClient.getAll<import('../types').ResearchMeta>>>
  settings: { key: string; value: unknown }[]
}

export async function exportDatabase(): Promise<DatabaseExport> {
  const settings = await storageClient.getAll<{ key: string; value: unknown }>(STORES.settings)
  return {
    version: 5,
    exportedAt: new Date().toISOString(),
    companies: await companiesRepo.getAll(),
    evidence: await evidenceRepo.getAll(),
    citations: await citationsRepo.getAll(),
    trusted_sources: await trustedSourcesRepo.getAll(),
    research_meta: await storageClient.getAll(STORES.research_meta),
    settings,
  }
}

export async function importDatabase(data: DatabaseExport): Promise<void> {
  for (const store of Object.values(STORES)) {
    await storageClient.clear(store)
  }
  for (const c of data.companies ?? []) await companiesRepo.put(c)
  for (const e of data.evidence ?? []) await evidenceRepo.put(e)
  for (const c of data.citations ?? []) await citationsRepo.put(c)
  for (const s of data.trusted_sources ?? []) await trustedSourcesRepo.put(s)
  for (const m of data.research_meta ?? []) await researchMetaRepo.put(m)
  for (const setting of data.settings ?? []) {
    if (setting && typeof setting === 'object' && 'key' in setting) {
      await settingsRepo.put(setting as { key: string; value: unknown })
    }
  }
}
