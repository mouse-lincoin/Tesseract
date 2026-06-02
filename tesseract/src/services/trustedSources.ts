import { trustedSourcesRepo } from '../db'
import type { TrustedSource } from '../types'

function now(): string {
  return new Date().toISOString()
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export async function listTrustedSources(companyId?: string): Promise<TrustedSource[]> {
  const all = await trustedSourcesRepo.getAll()
  const filtered = companyId
    ? all.filter((s) => !s.companyId || s.companyId === companyId)
    : all
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addTrustedSource(input: {
  url: string
  label: string
  tags: string[]
  note: string
  companyId?: string
}): Promise<TrustedSource> {
  const source: TrustedSource = {
    id: `src-${Date.now()}`,
    pattern: extractDomain(input.url),
    label: input.label.trim(),
    tags: input.tags,
    note: input.note.trim(),
    addedBy: 'human',
    companyId: input.companyId,
    createdAt: now(),
  }
  await trustedSourcesRepo.put(source)
  return source
}

export async function removeTrustedSource(id: string): Promise<void> {
  await trustedSourcesRepo.delete(id)
}
