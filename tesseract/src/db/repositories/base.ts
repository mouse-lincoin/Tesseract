import type { StorageClient } from '../client'
import type { IndexedStoreName } from '../schema'

export interface Repository<T> {
  get(id: string): Promise<T | undefined>
  getAll(): Promise<T[]>
  query(index: string, value: IDBValidKey): Promise<T[]>
  put(item: T): Promise<string>
  delete(id: string): Promise<void>
}

export function createRepository<T extends { id: string }>(
  client: StorageClient,
  store: IndexedStoreName,
): Repository<T> {
  return {
    get: (id) => client.get<T>(store, id),
    getAll: () => client.getAll<T>(store),
    query: (index, value) => client.queryByIndex<T>(store, index, value),
    put: (item) => client.put(store, item),
    delete: (id) => client.delete(store, id),
  }
}
