<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  companiesRepo,
  metricsRepo,
  exportDatabase,
  importDatabase,
  resetAndSeed,
} from '../db'
import type { Company, MetricPoint, MetricSeries, Market } from '../types'
import type { AiSettings } from '../types/research'
import { getAiSettings, saveAiSettings } from '../services/aiSettings'

const companies = ref<Company[]>([])
const metrics = ref<MetricSeries[]>([])
const selectedCompanyId = ref('')

const companyForm = ref({
  name: '',
  code: '',
  market: '港股' as Market,
  industryIds: 'SaaS / 企业软件',
})

const metricForm = ref({
  metricKey: 'NDR',
  source: '手动录入',
  pointsText: '2023,112\n2024,113',
})

const aiForm = ref<AiSettings>({
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
})

async function load() {
  aiForm.value = await getAiSettings()
  companies.value = await companiesRepo.getAll()
  metrics.value = await metricsRepo.getAll()
  if (!selectedCompanyId.value && companies.value[0]) {
    selectedCompanyId.value = companies.value[0].id
  }
}

function parsePoints(text: string): MetricPoint[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [period, valueStr] = line.split(/[,，\t\s]+/)
      return { period: period.trim(), value: Number(valueStr) }
    })
    .filter((p) => p.period && !Number.isNaN(p.value))
}

async function saveCompany() {
  if (!companyForm.value.name || !companyForm.value.code) {
    ElMessage.warning('请填写公司名称与代码')
    return
  }
  const id = `company-${Date.now()}`
  await companiesRepo.put({
    id,
    name: companyForm.value.name,
    code: companyForm.value.code,
    market: companyForm.value.market,
    industryIds: companyForm.value.industryIds.split(/[,，]/).map((s) => s.trim()),
  })
  ElMessage.success('公司已保存')
  companyForm.value.name = ''
  companyForm.value.code = ''
  await load()
  selectedCompanyId.value = id
}

async function saveMetric() {
  if (!selectedCompanyId.value) {
    ElMessage.warning('请先选择或创建公司')
    return
  }
  const points = parsePoints(metricForm.value.pointsText)
  if (points.length === 0) {
    ElMessage.warning('请按「期间,数值」格式录入至少一行')
    return
  }
  await metricsRepo.put({
    id: `metric-${selectedCompanyId.value}-${metricForm.value.metricKey}-${Date.now()}`,
    companyId: selectedCompanyId.value,
    metricKey: metricForm.value.metricKey,
    points,
    source: metricForm.value.source,
  })
  ElMessage.success('指标已保存')
  await load()
}

async function exportJson() {
  const data = await exportDatabase()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tesseract-export-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function onImportFile(file: File) {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    await importDatabase(data)
    ElMessage.success('导入成功')
    await load()
  } catch {
    ElMessage.error('导入失败，请检查 JSON 格式')
  }
  return false
}

async function resetSeed() {
  await resetAndSeed()
  ElMessage.success('已恢复内置示例数据')
  await load()
}

async function saveAi() {
  await saveAiSettings({ ...aiForm.value })
  ElMessage.success('AI 配置已保存（仅存于本机 IndexedDB）')
}

onMounted(load)
</script>

<template>
  <section class="data-page">
    <p class="intro">
      指标数据手动录入；研究讨论需配置 AI（OpenAI 兼容接口）。密钥仅存本地，不上传服务器。
    </p>

    <div class="card-surface panel ai-panel">
      <h3>AI 协作者（研究讨论）</h3>
      <p class="ai-hint">
        AI 被设定为<strong>不讨好</strong>的研究搭档：会质疑假设、区分事实与推断，并只建议检索方向（不编造数据）。
      </p>
      <el-form label-position="top">
        <el-form-item label="API Base URL">
          <el-input v-model="aiForm.apiBaseUrl" placeholder="https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="aiForm.apiKey" type="password" show-password placeholder="sk-..." />
        </el-form-item>
        <el-form-item label="模型">
          <el-input v-model="aiForm.model" placeholder="gpt-4o-mini" />
        </el-form-item>
        <el-button type="primary" @click="saveAi">保存 AI 配置</el-button>
      </el-form>
    </div>

    <div class="grid">
      <div class="card-surface panel">
        <h3>新增公司</h3>
        <el-form label-position="top" size="default">
          <el-form-item label="名称">
            <el-input v-model="companyForm.name" placeholder="金蝶国际" />
          </el-form-item>
          <el-form-item label="代码">
            <el-input v-model="companyForm.code" placeholder="0268.HK" />
          </el-form-item>
          <el-form-item label="市场">
            <el-select v-model="companyForm.market" style="width: 100%">
              <el-option label="港股" value="港股" />
              <el-option label="A股" value="A股" />
            </el-select>
          </el-form-item>
          <el-form-item label="行业（逗号分隔，支持复合）">
            <el-input v-model="companyForm.industryIds" />
          </el-form-item>
          <el-button type="primary" @click="saveCompany">保存公司</el-button>
        </el-form>
      </div>

      <div class="card-surface panel">
        <h3>录入指标时序</h3>
        <el-form label-position="top">
          <el-form-item label="公司">
            <el-select v-model="selectedCompanyId" style="width: 100%">
              <el-option
                v-for="c in companies"
                :key="c.id"
                :label="`${c.name} (${c.code})`"
                :value="c.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指标键（如 NDR）">
            <el-input v-model="metricForm.metricKey" />
          </el-form-item>
          <el-form-item label="数据来源">
            <el-input v-model="metricForm.source" />
          </el-form-item>
          <el-form-item label="时序（每行：期间,数值%）">
            <el-input v-model="metricForm.pointsText" type="textarea" :rows="6" />
          </el-form-item>
          <el-button type="primary" @click="saveMetric">保存指标</el-button>
        </el-form>
      </div>
    </div>

    <div class="card-surface panel actions">
      <h3>备份与恢复</h3>
      <div class="action-row">
        <el-button @click="exportJson">导出全库 JSON</el-button>
        <el-upload :show-file-list="false" accept=".json" :before-upload="onImportFile">
          <el-button>导入 JSON</el-button>
        </el-upload>
        <el-button type="warning" plain @click="resetSeed">恢复内置示例</el-button>
      </div>
    </div>

    <el-table :data="metrics" class="metrics-table" stripe>
      <el-table-column label="公司" min-width="120">
        <template #default="{ row }">
          {{ companies.find((c) => c.id === row.companyId)?.name ?? row.companyId }}
        </template>
      </el-table-column>
      <el-table-column prop="metricKey" label="指标" width="100" />
      <el-table-column label="期数" width="80">
        <template #default="{ row }">{{ row.points.length }}</template>
      </el-table-column>
      <el-table-column prop="source" label="来源" min-width="160" show-overflow-tooltip />
    </el-table>
  </section>
</template>

<style scoped>
.intro {
  color: var(--tesseract-muted);
  margin: 0 0 20px;
  line-height: 1.6;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.panel h3 {
  margin: 0 0 16px;
  font-size: 16px;
}
.ai-panel {
  margin-bottom: 16px;
}
.ai-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--tesseract-muted);
  line-height: 1.6;
}
.actions {
  margin-bottom: 20px;
}
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.metrics-table {
  width: 100%;
}
</style>
