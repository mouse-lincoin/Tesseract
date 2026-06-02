import { companiesRepo, messagesRepo } from '../db'
import { chatCompletion, type ChatMessage } from '../modules/ai/client'
import {
  RESEARCH_SYSTEM_PROMPT,
  buildResearchContext,
  stageKickoffPrompt,
} from '../modules/ai/prompts'
import type { DiscussionMessage, WatchlistItem } from '../types'
import { getAiSettings, isAiConfigured } from './aiSettings'
import { updateWatchlistItem } from './watchlist'

function now(): string {
  return new Date().toISOString()
}

export async function listMessages(watchlistId: string): Promise<DiscussionMessage[]> {
  const msgs = await messagesRepo.query('watchlistId', watchlistId)
  return msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function appendMessage(
  watchlistId: string,
  role: DiscussionMessage['role'],
  content: string,
  kind: DiscussionMessage['kind'] = 'chat',
): Promise<DiscussionMessage> {
  const msg: DiscussionMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    watchlistId,
    role,
    content,
    kind,
    createdAt: now(),
  }
  await messagesRepo.put(msg)
  return msg
}

export async function requestSearchBrief(item: WatchlistItem): Promise<DiscussionMessage> {
  const company = await companiesRepo.get(item.companyId)
  if (!company) throw new Error('公司不存在')

  const settings = await getAiSettings()
  const prompt = `【任务】仅输出「建议检索清单」，不要假装已经检索过。\n公司：${company.name}\n阶段：${item.stage}\n格式：每条一行，前缀【检索】，包含：查什么、去哪类公开来源、用来验证或推翻什么假设。`

  if (!isAiConfigured(settings)) {
    return appendMessage(
      item.id,
      'system',
      '未配置 AI API。请在「数据」页填写 API Key 后，AI 才能生成检索方向。你仍可手动记录检索结果到讨论区。',
      'search_brief',
    )
  }

  await appendMessage(item.id, 'user', prompt, 'search_brief')

  const history = await listMessages(item.id)
  const reply = await chatCompletion(
    settings,
    await buildChatPayload(item, history, prompt),
  )

  return appendMessage(item.id, 'assistant', reply, 'search_brief')
}

export async function sendUserMessage(
  item: WatchlistItem,
  userText: string,
): Promise<DiscussionMessage[]> {
  const company = await companiesRepo.get(item.companyId)
  if (!company) throw new Error('公司不存在')

  await appendMessage(item.id, 'user', userText)
  item.updatedAt = now()
  await updateWatchlistItem(item)

  const settings = await getAiSettings()
  if (!isAiConfigured(settings)) {
    await appendMessage(
      item.id,
      'system',
      '未配置 AI。你的观点已保存。配置 API 后可继续与 AI 讨论。',
      'chat',
    )
    return listMessages(item.id)
  }

  const history = await listMessages(item.id)
  const reply = await chatCompletion(
    settings,
    await buildChatPayload(item, history, userText),
  )
  await appendMessage(item.id, 'assistant', reply)
  return listMessages(item.id)
}

export async function startStageDialogue(item: WatchlistItem): Promise<DiscussionMessage[]> {
  const company = await companiesRepo.get(item.companyId)
  if (!company) throw new Error('公司不存在')

  const kickoff = stageKickoffPrompt(item.stage, company.name)
  return sendUserMessage(item, kickoff)
}

async function buildChatPayload(
  item: WatchlistItem,
  history: DiscussionMessage[],
  latestUser: string,
): Promise<ChatMessage[]> {
  const company = await companiesRepo.get(item.companyId)
  if (!company) throw new Error('公司不存在')

  const messages: ChatMessage[] = [
    { role: 'system', content: RESEARCH_SYSTEM_PROMPT },
    { role: 'system', content: buildResearchContext(company, item) },
  ]

  for (const m of history) {
    if (m.role === 'system') continue
    if (m.role === 'user') messages.push({ role: 'user', content: m.content })
    if (m.role === 'assistant') messages.push({ role: 'assistant', content: m.content })
  }

  const last = messages[messages.length - 1]
  if (!last || last.role !== 'user' || last.content !== latestUser) {
    messages.push({ role: 'user', content: latestUser })
  }

  return messages
}
