import type { Company, ResearchStage, WatchlistItem } from '../../types'
import { STAGE_HINTS, STAGE_LABELS } from '../../types/research'

export const RESEARCH_SYSTEM_PROMPT = `你是 Tesseract 的研究协作者，不是投资顾问，也不是用户的附和者。

你的职责：协助人类研究者逐步弄清一家公司的「关键限制因素」（生死线）与「发展因素」（在限制松动时什么会驱动增长）。

必须遵守：
1. **禁止讨好**：用户观点有漏洞时直接指出；不要为了显得友好而同意明显薄弱的推理。
2. **标注认知层级**：每条要点标明【事实】【推断】【假设】【未知】之一；无依据则标【未知】。
3. **优先反证**：主动提出可推翻当前假设的证据类型、替代解释与遗漏变量。
4. **检索诚实**：可建议公开信息检索方向（财报科目、行业指标、竞品对比），但**不得编造**未在对话中出现的具体数字、公告原文或新闻标题。
5. **克制结论**：以追问、对照、待核实清单为主；除非用户明确要求，避免「买入/卖出」「必然」「毫无疑问」等表述。
6. **中文输出**，简洁有条理，可用短列表。`

export function buildResearchContext(
  company: Company,
  item: WatchlistItem,
): string {
  const h = item.hypothesis
  const s = item.synthesis
  return [
    `【当前研究对象】${company.name}（${company.code}，${company.market}）`,
    `【行业标签】${company.industryIds.join('、')}`,
    `【研究阶段】${STAGE_LABELS[item.stage]} — ${STAGE_HINTS[item.stage]}`,
    item.statusNote ? `【研究员备注】${item.statusNote}` : '',
    h.keyConstraint ? `【假设·关键限制】${h.keyConstraint}` : '',
    h.growthDrivers?.length ? `【假设·发展因素】${h.growthDrivers.join('；')}` : '',
    h.openQuestions?.length ? `【待解问题】${h.openQuestions.join('；')}` : '',
    s.essence ? `【总结草稿】${s.essence}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function stageKickoffPrompt(stage: ResearchStage, companyName: string): string {
  const prompts: Record<ResearchStage, string> = {
    listed: `刚把 ${companyName} 列入观察名单。请用 3 条以内的追问，帮研究员明确：要先搞清哪些业务事实，才能谈关键限制因素？不要给结论。`,
    scoping: `正在厘清 ${companyName} 的业务与行业。请列出应检索的公开信息类型（而非虚构内容），并指出 2 个最容易被忽视的误判点。`,
    hypothesis: `请基于已有信息，各给出 1–2 个「关键限制因素」与「发展因素」的**候选假设**，每条标【假设】，并说明如何证伪。`,
    evidence: `进入证据核对阶段。请说明：验证当前假设各需要哪些可量化代理指标？缺数据时应如何标注，避免脑补？`,
    discuss: `进入讨论阶段。请扮演「挑剔的同事」：指出当前推理链最薄弱的一环，并提 2 个尖锐问题。`,
    synthesis: `接近总结。请帮研究员检查：总结是否混淆了事实与推断？还缺哪一块关键信息无法写进「本质总结」？`,
  }
  return prompts[stage]
}
