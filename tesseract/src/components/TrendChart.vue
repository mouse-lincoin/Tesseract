<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
} from 'echarts/components'
import type { MetricPoint } from '../types'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, MarkLineComponent])

const props = defineProps<{
  points: MetricPoint[]
  metricLabel: string
  threshold?: number
}>()

const option = computed(() => {
  const sorted = [...props.points].sort((a, b) => a.period.localeCompare(b.period))
  const markLine = props.threshold
    ? {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#8b949e', type: 'dashed' as const },
        label: { formatter: `参考 ${props.threshold}%`, color: '#8b949e' },
        data: [{ yAxis: props.threshold }],
      }
    : undefined

  return {
    backgroundColor: 'transparent',
    grid: { left: 48, right: 24, top: 32, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#161b22',
      borderColor: '#30363d',
      textStyle: { color: '#e6edf3' },
    },
    xAxis: {
      type: 'category',
      data: sorted.map((p) => p.period),
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#21262d' } },
      axisLabel: { color: '#8b949e', formatter: '{value}%' },
    },
    series: [
      {
        name: props.metricLabel,
        type: 'line',
        smooth: true,
        data: sorted.map((p) => p.value),
        lineStyle: { color: '#58a6ff', width: 2 },
        itemStyle: { color: '#58a6ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(88, 166, 255, 0.25)' },
              { offset: 1, color: 'rgba(88, 166, 255, 0)' },
            ],
          },
        },
        markLine,
      },
    ],
  }
})
</script>

<template>
  <div v-if="points.length" class="chart-wrap">
    <VChart class="chart" :option="option" autoresize />
  </div>
  <el-empty v-else description="暂无趋势数据" />
</template>

<style scoped>
.chart-wrap {
  width: 100%;
  height: 280px;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>
