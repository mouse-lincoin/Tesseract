import type { Company, DiscussionMessage, MetricSeries, Rule, WatchlistItem } from '../types'
import { companiesRepo, messagesRepo, metricsRepo, rulesRepo, settingsRepo, watchlistRepo } from './repositories'

const SEED_KEY = 'seeded'
const WATCHLIST_SEED_KEY = 'watchlist_seeded'

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

export const SEED_WATCHLIST: WatchlistItem = {
  id: 'watch-kingdee-demo',
  companyId: 'company-kingdee',
  stage: 'hypothesis',
  statusNote: '云 ERP 转型期，关注存量客户是否持续付费与扩容。',
  hypothesis: {
    keyConstraint: '客户流失（候选生死线，待用 NDR 等证据验证）',
    growthDrivers: ['云订阅占比提升', '大客户续费与扩容'],
    openQuestions: ['中小客户流失是否被行业大盘掩盖？'],
  },
  synthesis: { finalized: false },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const SEED_MESSAGES: DiscussionMessage[] = [
  {
    id: 'msg-seed-1',
    watchlistId: 'watch-kingdee-demo',
    role: 'system',
    content:
      '讨论区用于人机互相质疑。AI 不会刻意讨好；请自行区分【事实】与【推断】。配置 API Key 后可与 AI 对话。',
    kind: 'stage_note',
    createdAt: '2026-01-01T00:01:00.000Z',
  },
]

async function seedWatchlistIfNeeded(): Promise<void> {
  const done = await settingsRepo.get(WATCHLIST_SEED_KEY)
  if (done?.value === true) return
  const existing = await watchlistRepo.get(SEED_WATCHLIST.id)
  if (!existing) {
    await watchlistRepo.put(SEED_WATCHLIST)
    for (const m of SEED_MESSAGES) await messagesRepo.put(m)
  }
  await settingsRepo.put({ key: WATCHLIST_SEED_KEY, value: true })
}

export async function seedDatabaseIfNeeded(): Promise<boolean> {
  const existing = await settingsRepo.get(SEED_KEY)
  if (existing?.value === true) {
    await seedWatchlistIfNeeded()
    return false
  }

  await rulesRepo.put(SAAS_RULE)
  await companiesRepo.put(SEED_COMPANY)
  await metricsRepo.put(SEED_METRICS)
  await watchlistRepo.put(SEED_WATCHLIST)
  for (const m of SEED_MESSAGES) await messagesRepo.put(m)
  await settingsRepo.put({ key: SEED_KEY, value: true })
  await settingsRepo.put({ key: WATCHLIST_SEED_KEY, value: true })
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
