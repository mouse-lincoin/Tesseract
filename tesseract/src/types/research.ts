export type ResearchStage = 'map' | 'mechanism' | 'constraint' | 'system' | 'synthesis'

export type EpistemicType = 'fact' | 'inference' | 'hypothesis' | 'unknown'

export type LoopStep = 'orient' | 'collect' | 'challenge' | 'commit'

export interface ResearchMeta {
  companyId: string
  coreQuestions: string[]
  currentStage: ResearchStage
  stageDone: Partial<Record<ResearchStage, boolean>>
  loopRound: Partial<Record<ResearchStage, number>>
  orientNote: Partial<Record<ResearchStage, string>>
  updatedAt: string
}

export interface Citation {
  id: string
  companyId: string
  url: string
  title: string
  publisher?: string
  accessedAt: string
  excerpt?: string
  trustedSourceId?: string
}

export interface Evidence {
  id: string
  companyId: string
  stage: ResearchStage
  loopRound: number
  claim: string
  epistemic: EpistemicType
  summary: string
  citationIds: string[]
  falsifyIf?: string
  supersedesId?: string
  createdAt: string
}

export interface TrustedSource {
  id: string
  pattern: string
  label: string
  tags: string[]
  note: string
  addedBy: 'human' | 'ai_suggested'
  companyId?: string
  createdAt: string
}

export const STAGE_ORDER: ResearchStage[] = [
  'map',
  'mechanism',
  'constraint',
  'system',
  'synthesis',
]

export const STAGE_LABELS: Record<ResearchStage, string> = {
  map: '坐标系',
  mechanism: '机理',
  constraint: '约束',
  system: '系统',
  synthesis: '总结',
}

export const STAGE_GUIDES: Record<ResearchStage, string[]> = {
  map: [
    '收入从哪些产品线/地区来？各占多少？',
    '客户是谁？在产业链哪一段？',
    '与可比公司比，结构差异在哪？',
  ],
  mechanism: [
    '量、价、成本、费用里，谁驱动了利润变化？',
    '需求是行业 β 还是公司 α？',
    '毛利率变化是结构还是一次性？',
  ],
  constraint: [
    '当前最关键的限制是什么？（聚焦 1 条）',
    '用什么可观察代理指标验证？',
    '若限制缓解，发展因素与领先信号是什么？',
  ],
  system: [
    '上下游谁有定价权？客户集中度？',
    '政策/监管：顺风还是逆风？',
    '股权与激励是否与小股东一致？',
  ],
  synthesis: [
    '用一段话写本质（区分事实与推断）',
    '12–24 个月限制可能缓解吗？',
    '仍无法回答的 3 个问题是什么？',
  ],
}

export const EPISTEMIC_LABELS: Record<EpistemicType, string> = {
  fact: '事实',
  inference: '推断',
  hypothesis: '假设',
  unknown: '未知',
}

export const LOOP_LABELS: Record<LoopStep, string> = {
  orient: '定向',
  collect: '收集',
  challenge: '推敲',
  commit: '沉淀',
}
