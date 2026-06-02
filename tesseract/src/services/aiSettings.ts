import { settingsRepo } from '../db'

export interface AiSettings {
  apiBaseUrl: string
  apiKey: string
  model: string
}

export const DEFAULT_DEEPSEEK_SETTINGS: AiSettings = {
  apiBaseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-chat',
}

const AI_SETTINGS_KEY = 'ai_settings'

export async function getAiSettings(): Promise<AiSettings> {
  const entry = await settingsRepo.get(AI_SETTINGS_KEY)
  if (!entry?.value || typeof entry.value !== 'object') {
    return { ...DEFAULT_DEEPSEEK_SETTINGS }
  }
  return { ...DEFAULT_DEEPSEEK_SETTINGS, ...(entry.value as AiSettings) }
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  await settingsRepo.put({ key: AI_SETTINGS_KEY, value: settings })
}

export function isAiConfigured(settings: AiSettings): boolean {
  return Boolean(settings.apiKey.trim() && settings.apiBaseUrl.trim())
}
