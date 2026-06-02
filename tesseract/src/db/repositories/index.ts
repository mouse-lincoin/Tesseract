import { storageClient } from '../client'
import { STORES } from '../schema'
import { createRepository } from './base'
import type {
  AnalysisRecord,
  Company,
  DiscussionMessage,
  MetricSeries,
  Rule,
  SettingEntry,
  WatchlistItem,
} from '../../types'

export const rulesRepo = createRepository<Rule>(storageClient, STORES.rules)
export const companiesRepo = createRepository<Company>(storageClient, STORES.companies)
export const metricsRepo = createRepository<MetricSeries>(storageClient, STORES.metrics)
export const analysesRepo = createRepository<AnalysisRecord>(storageClient, STORES.analyses)
export const watchlistRepo = createRepository<WatchlistItem>(storageClient, STORES.watchlist)
export const messagesRepo = createRepository<DiscussionMessage>(storageClient, STORES.messages)

export const settingsRepo = {
  async get(key: string): Promise<SettingEntry | undefined> {
    return storageClient.get<SettingEntry>(STORES.settings, key)
  },
  async put(entry: SettingEntry): Promise<string> {
    return storageClient.put(STORES.settings, entry)
  },
}
