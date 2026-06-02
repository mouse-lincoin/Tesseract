import type { AiSettings } from '../../types/research'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  settings: AiSettings,
  messages: ChatMessage[],
): Promise<string> {
  const base = settings.apiBaseUrl.replace(/\/$/, '')
  const url = `${base}/chat/completions`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.4,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AI 请求失败 (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 返回为空')
  return content.trim()
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
}
