import { settingsRepo } from '../db'
import type { AiSettings } from '../types/research'
import { DEFAULT_AI_SETTINGS } from '../modules/ai/client'

const AI_SETTINGS_KEY = 'ai_settings'

export async function getAiSettings(): Promise<AiSettings> {
  const entry = await settingsRepo.get(AI_SETTINGS_KEY)
  if (!entry?.value || typeof entry.value !== 'object') {
    return { ...DEFAULT_AI_SETTINGS }
  }
  return { ...DEFAULT_AI_SETTINGS, ...(entry.value as AiSettings) }
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  await settingsRepo.put({ key: AI_SETTINGS_KEY, value: settings })
}

export function isAiConfigured(settings: AiSettings): boolean {
  return Boolean(settings.apiKey.trim() && settings.apiBaseUrl.trim())
}
