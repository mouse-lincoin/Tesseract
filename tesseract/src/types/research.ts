export type ResearchStage =
  | 'listed'
  | 'scoping'
  | 'hypothesis'
  | 'evidence'
  | 'discuss'
  | 'synthesis'

export interface ResearchHypothesis {
  keyConstraint?: string
  growthDrivers?: string[]
  openQuestions?: string[]
}

export interface ResearchSynthesis {
  essence?: string
  keyConstraint?: string
  growthFactors?: string[]
  uncertainties?: string[]
  finalized: boolean
}

export interface WatchlistItem {
  id: string
  companyId: string
  stage: ResearchStage
  statusNote?: string
  hypothesis: ResearchHypothesis
  synthesis: ResearchSynthesis
  createdAt: string
  updatedAt: string
}

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageKind = 'chat' | 'search_brief' | 'stage_note'

export interface DiscussionMessage {
  id: string
  watchlistId: string
  role: MessageRole
  content: string
  kind: MessageKind
  createdAt: string
}

export interface AiSettings {
  apiBaseUrl: string
  apiKey: string
  model: string
}

export const RESEARCH_STAGES: ResearchStage[] = [
  'listed',
  'scoping',
  'hypothesis',
  'evidence',
  'discuss',
  'synthesis',
]

export const STAGE_LABELS: Record<ResearchStage, string> = {
  listed: '列入观察',
  scoping: '业务厘清',
  hypothesis: '提出假设',
  evidence: '核对证据',
  discuss: '人机讨论',
  synthesis: '本质总结',
}

export const STAGE_HINTS: Record<ResearchStage, string> = {
  listed: '像研究员一样，先把标的放进观察名单，不急于下结论。',
  scoping: '弄清公司做什么、收入结构、行业归属；记录尚不清楚的问题。',
  hypothesis: '提出关键限制因素与发展因素的候选假设，允许被推翻。',
  evidence: '只为验证假设采集数据；没有数据就标为未知，不编造。',
  discuss: '与 AI 互相质疑、补全检索方向；避免讨好式附和。',
  synthesis: '用你自己的话写本质总结；区分事实、推断与未知。',
}
