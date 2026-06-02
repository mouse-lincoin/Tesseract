import type { MetricPoint, MetricSeries, Rule, TrendDirection } from '../../types'
import { TREND_LABELS } from '../../types'

const MIN_POINTS = 2

function sortPoints(points: MetricPoint[]): MetricPoint[] {
  return [...points].sort((a, b) => a.period.localeCompare(b.period))
}

export function computeTrend(points: MetricPoint[]): TrendDirection {
  const sorted = sortPoints(points)
  if (sorted.length < MIN_POINTS) return 'stable'

  const recentCount = Math.min(3, Math.floor(sorted.length / 2) || 1)
  const olderCount = recentCount
  const recent = sorted.slice(-recentCount)
  const older = sorted.slice(0, olderCount)

  const recentAvg = recent.reduce((s, p) => s + p.value, 0) / recent.length
  const olderAvg = older.reduce((s, p) => s + p.value, 0) / older.length
  const delta = recentAvg - olderAvg
  const threshold = Math.max(Math.abs(olderAvg) * 0.02, 0.5)

  if (delta > threshold) return 'improving'
  if (delta < -threshold) return 'worsening'
  return 'stable'
}

function formatTrendRange(points: MetricPoint[]): string {
  const sorted = sortPoints(points)
  if (sorted.length === 0) return '暂无数据'
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  return `${first.period} 的 ${first.value}% 至 ${last.period} 的 ${last.value}%`
}

export function buildPrediction(
  rule: Rule,
  series: MetricSeries | null,
  trend: TrendDirection,
): string {
  const trendLabel = TREND_LABELS[trend]
  const metricName = rule.proxyMetric

  if (!series || series.points.length === 0) {
    return `尚未录入 ${metricName} 时序数据，无法判断「${rule.constraintName}」的解决前景。请在数据录入页补充指标。`
  }

  const rangeText = formatTrendRange(series.points)
  const threshold = rule.threshold
  const last = sortPoints(series.points).at(-1)

  let outlook = ''
  if (trend === 'improving') {
    outlook =
      threshold && last && last.value < threshold
        ? `正在改善但仍未稳固（参考线约 ${threshold}%），预测短期内这一限制尚难被彻底解决。`
        : '改善趋势明显，但能否持续仍需观察后续季度。'
  } else if (trend === 'worsening') {
    outlook = '指标走弱，预测短期内这一关键限制可能继续承压。'
  } else {
    outlook = '变化不显著，预测短期内这一限制难以出现突破性改善。'
  }

  return `近 ${series.points.length} 期 ${metricName} 从 ${rangeText}，${trendLabel}。${outlook}`
}

export function metricKeyFromRule(rule: Rule): string {
  if (rule.proxyMetric.includes('NDR')) return 'NDR'
  return rule.proxyMetric.split('（')[0].trim()
}
