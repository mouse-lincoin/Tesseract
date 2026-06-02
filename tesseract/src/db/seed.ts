import type { WatchlistCompany } from '../types'
import { companiesRepo, settingsRepo } from './repositories'

const SEED_KEY = 'seeded_v3'

export const SEED_COMPANY: WatchlistCompany = {
  id: 'company-kingdee',
  name: '金蝶国际',
  code: '0268.HK',
  market: '港股',
  status: 'on_list',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

export async function seedDatabaseIfNeeded(): Promise<void> {
  const existing = await settingsRepo.get(SEED_KEY)
  if (existing?.value === true) return

  await companiesRepo.put(SEED_COMPANY)
  await settingsRepo.put({ key: SEED_KEY, value: true })
}
