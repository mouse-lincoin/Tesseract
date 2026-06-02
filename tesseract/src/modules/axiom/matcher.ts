import type { Company, Rule } from '../../types'

export function matchRulesForCompany(company: Company, rules: Rule[]): Rule[] {
  const normalizedIndustries = company.industryIds.map((id) => id.trim().toLowerCase())
  return rules.filter((rule) => {
    const industry = rule.industry.trim().toLowerCase()
    return normalizedIndustries.some(
      (id) => id === industry || id.includes(industry) || industry.includes(id),
    )
  })
}

export function findCompanyByQuery(
  companies: Company[],
  query: string,
): Company | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  return companies.find(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase() === q ||
      c.code.toLowerCase().replace('.hk', '') === q.replace('.hk', ''),
  )
}

export function constraintSummary(rule: Rule): string {
  return `${rule.industry} 的关键限制因素是「${rule.constraintName}」（代理指标：${rule.proxyMetric}）`
}
