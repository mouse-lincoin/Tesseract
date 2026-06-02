export type Market = 'A股' | '港股'

export type TrendDirection = 'improving' | 'stable' | 'worsening'

export interface Rule {
  id: string
  industry: string
  constraintName: string
  proxyMetric: string
  threshold?: number
  description?: string
}

export interface Company {
  id: string
  name: string
  code: string
  market: Market
  industryIds: string[]
}

export interface MetricPoint {
  period: string
  value: number
}

export interface MetricSeries {
  id: string
  companyId: string
  metricKey: string
  points: MetricPoint[]
  source: string
}

export interface AnalysisRecord {
  id: string
  companyId: string
  ruleId: string
  trend: TrendDirection
  prediction: string
  generatedAt: string
}

export interface SettingEntry {
  key: string
  value: unknown
}

export interface ConstraintResult {
  rule: Rule
  series: MetricSeries | null
  trend: TrendDirection
  trendLabel: string
  prediction: string
  constraintSummary: string
}

export interface AnalyzeResult {
  company: Company
  constraints: ConstraintResult[]
}

export const TREND_LABELS: Record<TrendDirection, string> = {
  improving: '正在改善',
  stable: '基本持平',
  worsening: '持续恶化',
}
