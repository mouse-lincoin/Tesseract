import type { MetricSeries } from '../../types'
import { metricsRepo } from '../../db'

export async function getMetricsForCompany(companyId: string): Promise<MetricSeries[]> {
  return metricsRepo.query('companyId', companyId)
}

export function findSeriesForMetric(
  seriesList: MetricSeries[],
  metricKey: string,
): MetricSeries | undefined {
  const key = metricKey.toLowerCase()
  return seriesList.find((s) => s.metricKey.toLowerCase() === key)
}
