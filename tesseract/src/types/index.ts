export type Market = 'A股' | '港股'

/** 在名单上 / 深入调查中 */
export type InvestigationStatus = 'on_list' | 'investigating'

export interface WatchlistCompany {
  id: string
  name: string
  code: string
  market: Market
  status: InvestigationStatus
  createdAt: string
  updatedAt: string
}

export const STATUS_LABELS: Record<InvestigationStatus, string> = {
  on_list: '在名单上',
  investigating: '调查中',
}

export interface SettingEntry {
  key: string
  value: unknown
}
