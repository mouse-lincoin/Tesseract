import type { AiSettings } from '../../services/aiSettings'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  settings: AiSettings,
  messages: ChatMessage[],
  options?: { json?: boolean },
): Promise<string> {
  const base = settings.apiBaseUrl.replace(/\/$/, '')
  const url = `${base}/v1/chat/completions`

  const body: Record<string, unknown> = {
    model: settings.model,
    messages,
    temperature: 0.3,
  }
  if (options?.json) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DeepSeek 请求失败 (${res.status}): ${text.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('DeepSeek 返回为空')
  return content.trim()
}
