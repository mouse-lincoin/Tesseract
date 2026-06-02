import { storageClient } from '../client'
import { STORES } from '../schema'
import { createRepository } from './base'
import type { WatchlistCompany } from '../../types'

export interface SettingEntry {
  key: string
  value: unknown
}

export const companiesRepo = createRepository<WatchlistCompany>(storageClient, STORES.companies)

export const settingsRepo = {
  async get(key: string): Promise<SettingEntry | undefined> {
    return storageClient.get<SettingEntry>(STORES.settings, key)
  },
  async put(entry: SettingEntry): Promise<string> {
    return storageClient.put(STORES.settings, entry)
  },
}
