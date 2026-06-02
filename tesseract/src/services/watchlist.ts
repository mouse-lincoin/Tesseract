import { companiesRepo, messagesRepo, watchlistRepo } from '../db'
import { findCompanyByQuery } from '../modules/axiom'
import type { Company, Market, WatchlistItem } from '../types'
import type { ResearchStage } from '../types/research'

function now(): string {
  return new Date().toISOString()
}

function emptyWatchlist(companyId: string): WatchlistItem {
  const t = now()
  return {
    id: `watch-${companyId}-${Date.now()}`,
    companyId,
    stage: 'listed',
    hypothesis: {},
    synthesis: { finalized: false },
    createdAt: t,
    updatedAt: t,
  }
}

export async function listWatchlist(): Promise<WatchlistItem[]> {
  const items = await watchlistRepo.getAll()
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getWatchlistItem(id: string): Promise<WatchlistItem | undefined> {
  return watchlistRepo.get(id)
}

export async function findWatchlistByCompany(companyId: string): Promise<WatchlistItem | undefined> {
  const items = await watchlistRepo.query('companyId', companyId)
  return items[0]
}

export async function addCompanyToWatchlist(input: {
  name: string
  code: string
  market: Market
  industryIds: string[]
}): Promise<{ company: Company; item: WatchlistItem; created: boolean }> {
  const companies = await companiesRepo.getAll()
  let company = findCompanyByQuery(companies, input.code) ?? findCompanyByQuery(companies, input.name)

  if (!company) {
    company = {
      id: `company-${Date.now()}`,
      name: input.name.trim(),
      code: input.code.trim(),
      market: input.market,
      industryIds: input.industryIds,
    }
    await companiesRepo.put(company)
  }

  const existing = await findWatchlistByCompany(company.id)
  if (existing) {
    return { company, item: existing, created: false }
  }

  const item = emptyWatchlist(company.id)
  await watchlistRepo.put(item)
  return { company, item, created: true }
}

export async function updateWatchlistItem(item: WatchlistItem): Promise<void> {
  item.updatedAt = now()
  await watchlistRepo.put(item)
}

export async function setWatchlistStage(item: WatchlistItem, stage: ResearchStage): Promise<void> {
  item.stage = stage
  await updateWatchlistItem(item)
}

export async function removeFromWatchlist(id: string): Promise<void> {
  const msgs = await messagesRepo.query('watchlistId', id)
  for (const m of msgs) await messagesRepo.delete(m.id)
  await watchlistRepo.delete(id)
}
