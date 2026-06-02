import { analysesRepo, companiesRepo, rulesRepo } from '../db'
import { matchRulesForCompany, findCompanyByQuery, constraintSummary } from '../modules/axiom'
import { getMetricsForCompany, findSeriesForMetric } from '../modules/sniper'
import { computeTrend, buildPrediction, metricKeyFromRule } from '../modules/forecast'
import type { AnalyzeResult, ConstraintResult, TrendDirection } from '../types'
import { TREND_LABELS } from '../types'

export async function analyzeCompany(query: string): Promise<AnalyzeResult | null> {
  const companies = await companiesRepo.getAll()
  const company = findCompanyByQuery(companies, query)
  if (!company) return null

  const allRules = await rulesRepo.getAll()
  const matchedRules = matchRulesForCompany(company, allRules)
  const metrics = await getMetricsForCompany(company.id)

  const constraints: ConstraintResult[] = []

  for (const rule of matchedRules) {
    const metricKey = metricKeyFromRule(rule)
    const series = findSeriesForMetric(metrics, metricKey) ?? null
    const trend: TrendDirection = series ? computeTrend(series.points) : 'stable'
    const prediction = buildPrediction(rule, series, trend)

    constraints.push({
      rule,
      series,
      trend,
      trendLabel: TREND_LABELS[trend],
      prediction,
      constraintSummary: constraintSummary(rule),
    })

    await analysesRepo.put({
      id: `analysis-${company.id}-${rule.id}-${Date.now()}`,
      companyId: company.id,
      ruleId: rule.id,
      trend,
      prediction,
      generatedAt: new Date().toISOString(),
    })
  }

  return { company, constraints }
}
