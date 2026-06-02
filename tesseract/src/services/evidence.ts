import { citationsRepo, evidenceRepo } from '../db'
import type { Citation, EpistemicType, Evidence, ResearchStage } from '../types'

function now(): string {
  return new Date().toISOString()
}

export async function listEvidence(companyId: string, stage?: ResearchStage): Promise<Evidence[]> {
  const all = await evidenceRepo.query('companyId', companyId)
  const filtered = stage ? all.filter((e) => e.stage === stage) : all
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function listActiveEvidence(
  companyId: string,
  stage: ResearchStage,
): Promise<Evidence[]> {
  const all = await listEvidence(companyId, stage)
  const replacedIds = new Set(
    all.map((e) => e.supersedesId).filter((id): id is string => Boolean(id)),
  )
  return all.filter((e) => !replacedIds.has(e.id))
}

export async function createCitation(input: {
  companyId: string
  url: string
  title: string
  publisher?: string
  excerpt?: string
  trustedSourceId?: string
}): Promise<Citation> {
  const citation: Citation = {
    id: `cite-${Date.now()}`,
    companyId: input.companyId,
    url: input.url.trim(),
    title: input.title.trim() || input.url,
    publisher: input.publisher?.trim(),
    accessedAt: new Date().toISOString().slice(0, 10),
    excerpt: input.excerpt?.trim(),
    trustedSourceId: input.trustedSourceId,
  }
  await citationsRepo.put(citation)
  return citation
}

export async function getCitations(ids: string[]): Promise<Citation[]> {
  const result: Citation[] = []
  for (const id of ids) {
    const c = await citationsRepo.get(id)
    if (c) result.push(c)
  }
  return result
}

export async function createEvidence(input: {
  companyId: string
  stage: ResearchStage
  loopRound: number
  claim: string
  epistemic: EpistemicType
  summary: string
  citationIds: string[]
  falsifyIf?: string
  supersedesId?: string
}): Promise<Evidence> {
  if (input.epistemic === 'fact' && input.citationIds.length === 0) {
    throw new Error('【事实】类证据至少需要 1 条引用')
  }

  const evidence: Evidence = {
    id: `ev-${Date.now()}`,
    companyId: input.companyId,
    stage: input.stage,
    loopRound: input.loopRound,
    claim: input.claim.trim(),
    epistemic: input.epistemic,
    summary: input.summary.trim(),
    citationIds: input.citationIds,
    falsifyIf: input.falsifyIf?.trim(),
    supersedesId: input.supersedesId,
    createdAt: now(),
  }
  await evidenceRepo.put(evidence)
  return evidence
}

export async function deleteEvidence(id: string): Promise<void> {
  await evidenceRepo.delete(id)
}
