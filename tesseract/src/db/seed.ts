import type { Company, MetricSeries, Rule } from '../types'
import { companiesRepo, metricsRepo, rulesRepo, settingsRepo } from './repositories'

const SEED_KEY = 'seeded'

export const SAAS_RULE: Rule = {
  id: 'rule-saas-churn',
  industry: 'SaaS / 企业软件',
  constraintName: '客户流失',
  proxyMetric: 'NDR（净收入留存率）',
  threshold: 110,
  description:
    'SaaS 企业的生死线在于现有客户是否持续付费与扩容。NDR 低于 100% 意味着存量客户在萎缩。',
}

export const SEED_COMPANY: Company = {
  id: 'company-kingdee',
  name: '金蝶国际',
  code: '0268.HK',
  market: '港股',
  industryIds: ['SaaS / 企业软件'],
}

export const SEED_METRICS: MetricSeries = {
  id: 'metric-kingdee-ndr',
  companyId: 'company-kingdee',
  metricKey: 'NDR',
  source: '内置示例数据（演示用）',
  points: [
    { period: '2020', value: 105 },
    { period: '2021', value: 107 },
    { period: '2022', value: 109 },
    { period: '2023', value: 112 },
    { period: '2024', value: 113 },
  ],
}

export async function seedDatabaseIfNeeded(): Promise<boolean> {
  const existing = await settingsRepo.get(SEED_KEY)
  if (existing?.value === true) {
    return false
  }

  await rulesRepo.put(SAAS_RULE)
  await companiesRepo.put(SEED_COMPANY)
  await metricsRepo.put(SEED_METRICS)
  await settingsRepo.put({ key: SEED_KEY, value: true })
  return true
}

import { storageClient } from './client'
import { STORES } from './schema'

export async function resetAndSeed(): Promise<void> {
  for (const store of Object.values(STORES)) {
    await storageClient.clear(store)
  }
  await settingsRepo.put({ key: SEED_KEY, value: false })
  await seedDatabaseIfNeeded()
}
