import { storageClient } from './client'
import { STORES } from './schema'
import { companiesRepo, settingsRepo } from './repositories'
import { seedDatabaseIfNeeded } from './seed'

export { storageClient, getDb } from './client'
export { companiesRepo, settingsRepo } from './repositories'
export { seedDatabaseIfNeeded, SEED_COMPANY } from './seed'

export interface DatabaseExport {
  version: number
  exportedAt: string
  companies: Awaited<ReturnType<typeof companiesRepo.getAll>>
  settings: { key: string; value: unknown }[]
}

export async function exportDatabase(): Promise<DatabaseExport> {
  const settings = await storageClient.getAll<{ key: string; value: unknown }>(STORES.settings)
  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    companies: await companiesRepo.getAll(),
    settings,
  }
}

export async function importDatabase(data: DatabaseExport): Promise<void> {
  for (const store of Object.values(STORES)) {
    await storageClient.clear(store)
  }
  for (const company of data.companies ?? []) await companiesRepo.put(company)
  for (const setting of data.settings ?? []) {
    if (setting && typeof setting === 'object' && 'key' in setting) {
      await settingsRepo.put(setting as { key: string; value: unknown })
    }
  }
}

export async function initDatabase(): Promise<void> {
  await seedDatabaseIfNeeded()
}
