export const DB_NAME = 'tesseract-db'
export const DB_VERSION = 3

export const STORES = {
  companies: 'companies',
  settings: 'settings',
} as const

export type StoreName = (typeof STORES)[keyof typeof STORES]
export type IndexedStoreName = Exclude<StoreName, 'settings'>
