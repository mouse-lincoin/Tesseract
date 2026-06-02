import { defineStore } from 'pinia'
import { ref } from 'vue'
import { initDatabase } from '../db'

export const useAppStore = defineStore('app', () => {
  const ready = ref(false)
  const error = ref<string | null>(null)

  async function bootstrap() {
    try {
      await initDatabase()
      ready.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '数据库初始化失败'
    }
  }

  return { ready, error, bootstrap }
})
