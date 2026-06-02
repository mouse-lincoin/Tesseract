import { companiesRepo } from '../../db'
import { chatCompletion } from '../../modules/ai/client'
import {
  AUTO_RESEARCH_SYSTEM,
  buildAutoRoundUserPrompt,
  buildContinueLoopPrompt,
} from '../../modules/ai/prompts'
import type { EpistemicType, ResearchMeta, ResearchStage } from '../../types'
import { STAGE_LABELS } from '../../types/research'
import { getAiSettings, isAiConfigured } from '../aiSettings'
import { createCitation, createEvidence, listActiveEvidence } from '../evidence'
import {
  bumpLoopRound,
  currentLoopRound,
  ensureResearchMeta,
  updateResearchMeta,
} from '../research'
import { addTrustedSource, listTrustedSources } from '../trustedSources'

export interface CompanyContext {
  companyId: string
  companyName: string
  stage: ResearchStage
  stageLabel: string
  loopRound: number
  coreQuestions: string[]
  orientNote: string
  trustedSourceHints: string[]
  existingEvidenceSummary: string
}

export interface AiCitationInput {
  url: string
  title: string
  excerpt?: string
}

export interface AiEvidenceInput {
  claim: string
  epistemic: EpistemicType
  summary: string
  falsify_if?: string
  citations: AiCitationInput[]
}

export interface AutoRoundResult {
  orient: string
  collect_notes: string
  challenge: string
  continue_loop: boolean
  suggested_source_urls: string[]
  evidences: AiEvidenceInput[]
}

export interface RunAutoRoundOutput {
  parsed: AutoRoundResult
  createdEvidenceIds: string[]
  loopRound: number
  continueLoop: boolean
}

function parseEpistemic(v: string): EpistemicType {
  if (v === 'fact' || v === 'inference' || v === 'hypothesis' || v === 'unknown') return v
  return 'inference'
}

function extractJson(text: string): AutoRoundResult {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed) as AutoRoundResult
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI 未返回有效 JSON')
    return JSON.parse(match[0]) as AutoRoundResult
  }
}

export async function buildCompanyContext(
  companyId: string,
  stage: ResearchStage,
  meta: ResearchMeta,
): Promise<CompanyContext> {
  const company = await companiesRepo.get(companyId)
  if (!company) throw new Error('公司不存在')

  const sources = await listTrustedSources(companyId)
  const globalSources = await listTrustedSources()
  const hints = [...sources, ...globalSources]
    .map((s) => `${s.label}（${s.pattern}）`)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 12)

  const existing = await listActiveEvidence(companyId, stage)
  const existingEvidenceSummary = existing
    .map((e) => `- [${e.epistemic}] ${e.claim}`)
    .join('\n')

  return {
    companyId,
    companyName: company.name,
    stage,
    stageLabel: STAGE_LABELS[stage],
    loopRound: currentLoopRound(meta, stage),
    coreQuestions: meta.coreQuestions,
    orientNote: meta.orientNote[stage] ?? '',
    trustedSourceHints: hints,
    existingEvidenceSummary,
  }
}

export async function runAutoRound(
  companyId: string,
  stage: ResearchStage,
  options?: { continueFromPrior?: boolean },
): Promise<RunAutoRoundOutput> {
  const settings = await getAiSettings()
  if (!isAiConfigured(settings)) {
    throw new Error('请先在「AI 设置」中配置 DeepSeek API Key')
  }

  const meta = await ensureResearchMeta(companyId)
  const ctx = await buildCompanyContext(companyId, stage, meta)
  const userPrompt = options?.continueFromPrior
    ? buildContinueLoopPrompt(ctx)
    : buildAutoRoundUserPrompt(ctx)

  const raw = await chatCompletion(
    settings,
    [
      { role: 'system', content: AUTO_RESEARCH_SYSTEM },
      { role: 'user', content: userPrompt },
    ],
    { json: true },
  )

  const parsed = extractJson(raw)
  meta.orientNote[stage] = [parsed.orient, parsed.collect_notes].filter(Boolean).join('\n\n')
  await updateResearchMeta(meta)

  const loopRound = currentLoopRound(meta, stage)
  const createdEvidenceIds: string[] = []

  for (const ev of parsed.evidences ?? []) {
    const citationIds: string[] = []
    for (const c of ev.citations ?? []) {
      if (!c.url?.trim()) continue
      const cite = await createCitation({
        companyId,
        url: c.url,
        title: c.title || c.url,
        excerpt: c.excerpt,
      })
      citationIds.push(cite.id)
    }

    const epistemic = parseEpistemic(ev.epistemic)
    if (epistemic === 'fact' && citationIds.length === 0) {
      continue
    }

    const record = await createEvidence({
      companyId,
      stage,
      loopRound,
      claim: ev.claim,
      epistemic,
      summary: ev.summary,
      citationIds,
      falsifyIf: ev.falsify_if,
    })
    createdEvidenceIds.push(record.id)
  }

  for (const url of parsed.suggested_source_urls ?? []) {
    if (!url?.startsWith('http')) continue
    try {
      await addTrustedSource({
        url,
        label: url,
        tags: ['ai_suggested'],
        note: 'AI 建议信源',
        companyId,
      })
    } catch {
      /* 重复域名等忽略 */
    }
  }

  await bumpLoopRound(meta, stage)

  return {
    parsed,
    createdEvidenceIds,
    loopRound,
    continueLoop: Boolean(parsed.continue_loop),
  }
}

/** 全自动：连续执行多轮直到 AI 认为无需继续或达到上限 */
export async function runAutoLoopChain(
  companyId: string,
  stage: ResearchStage,
  maxRounds = 3,
): Promise<RunAutoRoundOutput[]> {
  const results: RunAutoRoundOutput[] = []
  let continueFromPrior = false

  for (let i = 0; i < maxRounds; i++) {
    const out = await runAutoRound(companyId, stage, { continueFromPrior })
    results.push(out)
    continueFromPrior = true
    if (!out.continueLoop) break
  }

  return results
}

export async function runAutoAllStages(
  companyId: string,
  maxRoundsPerStage = 2,
): Promise<{ stage: ResearchStage; rounds: RunAutoRoundOutput[] }[]> {
  const meta = await ensureResearchMeta(companyId)
  const stages: ResearchStage[] = ['map', 'mechanism', 'constraint', 'system', 'synthesis']
  const output: { stage: ResearchStage; rounds: RunAutoRoundOutput[] }[] = []

  for (const stage of stages) {
    meta.currentStage = stage
    if (!meta.loopRound[stage]) meta.loopRound[stage] = 1
    await updateResearchMeta(meta)
    const rounds = await runAutoLoopChain(companyId, stage, maxRoundsPerStage)
    output.push({ stage, rounds })
    meta.stageDone[stage] = true
    await updateResearchMeta(meta)
  }

  return output
}
