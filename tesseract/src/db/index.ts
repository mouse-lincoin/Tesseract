import { storageClient } from './client'
import { STORES } from './schema'
import {
  analysesRepo,
  companiesRepo,
  messagesRepo,
  metricsRepo,
  rulesRepo,
  settingsRepo,
  watchlistRepo,
} from './repositories'
import { seedDatabaseIfNeeded } from './seed'

export { storageClient, getDb } from './client'
export {
  rulesRepo,
  companiesRepo,
  metricsRepo,
  analysesRepo,
  settingsRepo,
  watchlistRepo,
  messagesRepo,
} from './repositories'
export { seedDatabaseIfNeeded, resetAndSeed, SAAS_RULE, SEED_COMPANY } from './seed'

export interface DatabaseExport {
  version: number
  exportedAt: string
  rules: Awaited<ReturnType<typeof rulesRepo.getAll>>
  companies: Awaited<ReturnType<typeof companiesRepo.getAll>>
  metrics: Awaited<ReturnType<typeof metricsRepo.getAll>>
  analyses: Awaited<ReturnType<typeof analysesRepo.getAll>>
  watchlist: Awaited<ReturnType<typeof watchlistRepo.getAll>>
  messages: Awaited<ReturnType<typeof messagesRepo.getAll>>
  settings: { key: string; value: unknown }[]
}

export async function exportDatabase(): Promise<DatabaseExport> {
  const settings = await storageClient.getAll<{ key: string; value: unknown }>(STORES.settings)
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    rules: await rulesRepo.getAll(),
    companies: await companiesRepo.getAll(),
    metrics: await metricsRepo.getAll(),
    analyses: await analysesRepo.getAll(),
    watchlist: await watchlistRepo.getAll(),
    messages: await messagesRepo.getAll(),
    settings,
  }
}

export async function importDatabase(data: DatabaseExport): Promise<void> {
  for (const store of Object.values(STORES)) {
    await storageClient.clear(store)
  }
  for (const rule of data.rules) await rulesRepo.put(rule)
  for (const company of data.companies) await companiesRepo.put(company)
  for (const metric of data.metrics) await metricsRepo.put(metric)
  for (const analysis of data.analyses) await analysesRepo.put(analysis)
  for (const w of data.watchlist ?? []) await watchlistRepo.put(w)
  for (const m of data.messages ?? []) await messagesRepo.put(m)
  for (const setting of data.settings ?? []) {
    if (setting && typeof setting === 'object' && 'key' in setting) {
      await settingsRepo.put(setting as { key: string; value: unknown })
    }
  }
}

export async function initDatabase(): Promise<void> {
  await seedDatabaseIfNeeded()
}
