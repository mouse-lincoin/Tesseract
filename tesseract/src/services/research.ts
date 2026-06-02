import { analyzeCompany } from './analyze'
import type { AnalyzeResult } from '../types'
import type { ResearchStage } from '../types/research'
import { RESEARCH_STAGES } from '../types/research'

export function nextStage(current: ResearchStage): ResearchStage | null {
  const i = RESEARCH_STAGES.indexOf(current)
  return i < RESEARCH_STAGES.length - 1 ? RESEARCH_STAGES[i + 1] : null
}

export function prevStage(current: ResearchStage): ResearchStage | null {
  const i = RESEARCH_STAGES.indexOf(current)
  return i > 0 ? RESEARCH_STAGES[i - 1] : null
}

/** 证据阶段：用已有指标做辅助对照（非终局结论） */
export async function loadEvidenceSnapshot(
  companyName: string,
): Promise<AnalyzeResult | null> {
  return analyzeCompany(companyName)
}
