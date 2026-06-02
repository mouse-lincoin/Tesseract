<script setup lang="ts">
import type { ConstraintResult } from '../types'
import TrendChart from './TrendChart.vue'

defineProps<{
  result: ConstraintResult
  companyName: string
}>()
</script>

<template>
  <article class="card-surface constraint-card">
    <p class="constraint-line">
      <strong>{{ companyName }}</strong> 的关键限制因素是
      <em>{{ result.rule.constraintName }}</em>
      <span class="meta">（{{ result.rule.industry }} · {{ result.rule.proxyMetric }}）</span>
    </p>

    <TrendChart
      :points="result.series?.points ?? []"
      :metric-label="result.rule.proxyMetric"
      :threshold="result.rule.threshold"
    />

    <p class="prediction" :class="`trend-${result.trend}`">
      <span class="badge">{{ result.trendLabel }}</span>
      {{ result.prediction }}
    </p>
    <p v-if="result.series?.source" class="source">数据来源：{{ result.series.source }}</p>
  </article>
</template>

<style scoped>
.constraint-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.constraint-line {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}
.constraint-line em {
  color: var(--tesseract-accent);
  font-style: normal;
  font-weight: 600;
}
.meta {
  color: var(--tesseract-muted);
  font-size: 13px;
}
.prediction {
  margin: 0;
  line-height: 1.7;
  font-size: 15px;
}
.badge {
  display: inline-block;
  margin-right: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.06);
}
.source {
  margin: 0;
  font-size: 12px;
  color: var(--tesseract-muted);
}
</style>
