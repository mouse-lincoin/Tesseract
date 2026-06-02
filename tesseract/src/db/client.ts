import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { WatchlistCompany } from '../types'
import type { SettingEntry } from '../types'
import { DB_NAME, DB_VERSION, STORES, type IndexedStoreName, type StoreName } from './schema'

export interface TesseractDB extends DBSchema {
  companies: {
    key: string
    value: WatchlistCompany
    indexes: { code: string; status: string }
  }
  settings: {
    key: string
    value: SettingEntry
  }
}

let dbPromise: Promise<IDBPDatabase<TesseractDB>> | null = null

export function getDb(): Promise<IDBPDatabase<TesseractDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TesseractDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 3) {
          for (const name of Array.from(db.objectStoreNames)) {
            db.deleteObjectStore(name)
          }
        }
        if (!db.objectStoreNames.contains(STORES.companies)) {
          const companies = db.createObjectStore(STORES.companies, { keyPath: 'id' })
          companies.createIndex('code', 'code', { unique: false })
          companies.createIndex('status', 'status', { unique: false })
        }
        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings, { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export interface StorageClient {
  get<T>(store: StoreName, id: string): Promise<T | undefined>
  getAll<T>(store: StoreName): Promise<T[]>
  queryByIndex<T>(store: IndexedStoreName, index: string, value: IDBValidKey): Promise<T[]>
  put<T>(store: StoreName, item: T): Promise<string>
  delete(store: StoreName, id: string): Promise<void>
  clear(store: StoreName): Promise<void>
}

export class IdbStorageClient implements StorageClient {
  async get<T>(store: StoreName, id: string): Promise<T | undefined> {
    const db = await getDb()
    return (await db.get(store, id)) as T | undefined
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const db = await getDb()
    return (await db.getAll(store)) as T[]
  }

  async queryByIndex<T>(
    store: IndexedStoreName,
    index: string,
    value: IDBValidKey,
  ): Promise<T[]> {
    const all = await this.getAll<T>(store)
    return all.filter((item) => (item as Record<string, unknown>)[index] === value)
  }

  async put<T>(store: StoreName, item: T): Promise<string> {
    const db = await getDb()
    const key = await db.put(store, item as never)
    return String(key)
  }

  async delete(store: StoreName, id: string): Promise<void> {
    const db = await getDb()
    await db.delete(store, id)
  }

  async clear(store: StoreName): Promise<void> {
    const db = await getDb()
    await db.clear(store)
  }
}

export const storageClient: StorageClient = new IdbStorageClient()
