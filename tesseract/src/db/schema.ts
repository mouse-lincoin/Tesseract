export const DB_NAME = 'tesseract-db'
export const DB_VERSION = 1

export const STORES = {
  rules: 'rules',
  companies: 'companies',
  metrics: 'metrics',
  analyses: 'analyses',
  settings: 'settings',
} as const

export type StoreName = (typeof STORES)[keyof typeof STORES]

/** 带索引的对象仓库（settings 为 KV，无二级索引） */
export type IndexedStoreName = Exclude<StoreName, 'settings'>
