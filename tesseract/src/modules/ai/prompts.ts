export interface AutoPromptContext {
  companyName: string
  stage: string
  stageLabel: string
  loopRound: number
  coreQuestions: string[]
  orientNote: string
  trustedSourceHints: string[]
  existingEvidenceSummary: string
}

export const AUTO_RESEARCH_SYSTEM = `你是 Tesseract 的资深调研协作者，使用简体中文。

用户要求全自动调研：你需完成定向、收集规划、推敲、并输出可入库的结构化结果。

原则：
1. 禁止讨好用户；主动提出反证与替代解释。
2. 区分 fact（有公开来源支撑）/ inference / hypothesis / unknown。
3. 不得编造访问过的网页内容；citations 只列真实可访问的 URL（如港交所披露易、公司投资者关系、交易所公告等），若无法确认具体 URL 则 epistemic 用 unknown 且 citations 为空。
4. 每条 fact 至少一个 citation；无来源则 epistemic 必须为 unknown。
5. 输出必须是合法 JSON，不要 markdown 代码块外的文字。`

export function buildAutoRoundUserPrompt(ctx: AutoPromptContext): string {
  return `【公司】${ctx.companyName}
【阶段】${ctx.stageLabel}（${ctx.stage}）
【本轮】第 ${ctx.loopRound} 轮
【待解问题】${ctx.coreQuestions.filter(Boolean).join('；') || '（未填）'}
【本阶段定向备注】${ctx.orientNote || '（无）'}
【优质信源库】${ctx.trustedSourceHints.join('；') || '（暂无）'}
【已有证据】
${ctx.existingEvidenceSummary || '（无）'}

请完成本轮调研并返回 JSON：
{
  "orient": "本轮验证焦点（2-4句）",
  "collect_notes": "收集与阅读策略（不假装已读）",
  "challenge": "推敲：反证、逻辑漏洞、待核实项",
  "continue_loop": true,
  "suggested_source_urls": ["建议加入信源库的 url"],
  "evidences": [
    {
      "claim": "一句主张",
      "epistemic": "fact|inference|hypothesis|unknown",
      "summary": "2-5句摘要",
      "falsify_if": "证伪条件或空",
      "citations": [{ "url": "https://...", "title": "标题", "excerpt": "可选摘录" }]
    }
  ]
}

evidences 至少 1 条、最多 3 条。continue_loop 表示是否建议同阶段再开一轮（信息不足时为 true）。`
}

export function buildContinueLoopPrompt(ctx: AutoPromptContext): string {
  return `${buildAutoRoundUserPrompt(ctx)}

【特别说明】上一轮已完成基础调研，本轮是在此基础上深化或修正，请显式回应已有证据中的薄弱点。`
}
