import { companiesRepo } from '../db'
import type { WatchlistCompany } from '../types'
import { ensureResearchMeta } from './research'

function now(): string {
  return new Date().toISOString()
}

export async function listCompanies(): Promise<WatchlistCompany[]> {
  const all = await companiesRepo.getAll()
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getCompany(id: string): Promise<WatchlistCompany | undefined> {
  return companiesRepo.get(id)
}

export async function addCompany(name: string): Promise<WatchlistCompany> {
  const t = now()
  const company: WatchlistCompany = {
    id: `company-${Date.now()}`,
    name: name.trim(),
    status: 'on_list',
    createdAt: t,
    updatedAt: t,
  }
  await companiesRepo.put(company)
  await ensureResearchMeta(company.id)
  return company
}

export async function startInvestigation(id: string): Promise<WatchlistCompany> {
  const company = await companiesRepo.get(id)
  if (!company) throw new Error('公司不存在')
  if (company.status === 'investigating') return company

  company.status = 'investigating'
  company.updatedAt = now()
  await companiesRepo.put(company)
  await ensureResearchMeta(company.id)
  return company
}

export async function removeCompany(id: string): Promise<void> {
  await companiesRepo.delete(id)
}
