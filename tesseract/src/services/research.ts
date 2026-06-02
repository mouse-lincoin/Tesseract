import { researchMetaRepo } from '../db'
import type { ResearchMeta, ResearchStage } from '../types'
import { STAGE_ORDER } from '../types/research'

function now(): string {
  return new Date().toISOString()
}

export function defaultResearchMeta(companyId: string): ResearchMeta {
  return {
    companyId,
    coreQuestions: ['', '', ''],
    currentStage: 'map',
    stageDone: {},
    loopRound: { map: 1 },
    orientNote: {},
    updatedAt: now(),
  }
}

export async function ensureResearchMeta(companyId: string): Promise<ResearchMeta> {
  let meta = await researchMetaRepo.get(companyId)
  if (!meta) {
    meta = defaultResearchMeta(companyId)
    await researchMetaRepo.put(meta)
  }
  return meta
}

export async function updateResearchMeta(meta: ResearchMeta): Promise<void> {
  meta.updatedAt = now()
  await researchMetaRepo.put(meta)
}

export async function setStage(meta: ResearchMeta, stage: ResearchStage): Promise<ResearchMeta> {
  meta.currentStage = stage
  if (!meta.loopRound[stage]) meta.loopRound[stage] = 1
  await updateResearchMeta(meta)
  return meta
}

export async function advanceStage(meta: ResearchMeta): Promise<ResearchMeta | null> {
  const idx = STAGE_ORDER.indexOf(meta.currentStage)
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null
  meta.stageDone[meta.currentStage] = true
  const next = STAGE_ORDER[idx + 1]
  meta.currentStage = next
  if (!meta.loopRound[next]) meta.loopRound[next] = 1
  await updateResearchMeta(meta)
  return meta
}

export async function bumpLoopRound(meta: ResearchMeta, stage: ResearchStage): Promise<number> {
  const round = (meta.loopRound[stage] ?? 1) + 1
  meta.loopRound[stage] = round
  await updateResearchMeta(meta)
  return round
}

export function currentLoopRound(meta: ResearchMeta, stage: ResearchStage): number {
  return meta.loopRound[stage] ?? 1
}
