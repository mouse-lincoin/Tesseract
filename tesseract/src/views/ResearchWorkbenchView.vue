<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import EvidenceList from '../components/EvidenceList.vue'
import ResearchLoopPanel from '../components/ResearchLoopPanel.vue'
import { getCompany } from '../services/companies'
import {
  getCitations,
  listActiveEvidence,
  listEvidence,
  deleteEvidence,
} from '../services/evidence'
import {
  advanceStage,
  ensureResearchMeta,
  setStage,
  updateResearchMeta,
} from '../services/research'
import type { Citation, Evidence, ResearchMeta, ResearchStage, WatchlistCompany } from '../types'
import { STATUS_LABELS } from '../types'
import { STAGE_LABELS, STAGE_ORDER } from '../types/research'

const route = useRoute()
const router = useRouter()

const company = ref<WatchlistCompany | null>(null)
const meta = ref<ResearchMeta | null>(null)
const evidence = ref<Evidence[]>([])
const citationsMap = ref<Record<string, Citation>>({})
const supersedeId = ref<string>()
const activeStage = ref<ResearchStage>('map')

const companyId = computed(() => route.params.id as string)

async function loadEvidence() {
  if (!company.value || company.value.status !== 'investigating') return
  const stage = activeStage.value
  evidence.value = await listActiveEvidence(companyId.value, stage)
  const all = await listEvidence(companyId.value, stage)
  const ids = [...new Set(all.flatMap((e) => e.citationIds))]
  const cites = await getCitations(ids)
  citationsMap.value = Object.fromEntries(cites.map((c) => [c.id, c]))
}

async function load() {
  company.value = (await getCompany(companyId.value)) ?? null
  if (!company.value) return
  if (company.value.status === 'investigating') {
    meta.value = await ensureResearchMeta(companyId.value)
    activeStage.value = meta.value.currentStage
    await loadEvidence()
  }
}

function onTabChange(name: string | number) {
  onStageChange(name as ResearchStage)
}

async function onStageChange(stage: ResearchStage) {
  if (!meta.value) return
  await setStage(meta.value, stage)
  activeStage.value = stage
  supersedeId.value = undefined
  await loadEvidence()
}

async function saveQuestions() {
  if (!meta.value) return
  await updateResearchMeta(meta.value)
  ElMessage.success('已保存待解问题')
}

async function nextStage() {
  if (!meta.value) return
  const next = await advanceStage(meta.value)
  if (!next) {
    ElMessage.info('已在最后阶段')
    return
  }
  activeStage.value = next.currentStage
  supersedeId.value = undefined
  ElMessage.success(`已进入：${STAGE_LABELS[next.currentStage]}`)
  await loadEvidence()
}

function onMetaUpdate(m: ResearchMeta) {
  meta.value = m
}

function onSupersede(id: string) {
  supersedeId.value = id
  ElMessage.info('请在沉淀区提交修订版')
}

async function onRemove(id: string) {
  await deleteEvidence(id)
  await loadEvidence()
}

watch(companyId, load)
onMounted(load)
</script>

<template>
  <section class="workbench">
    <button type="button" class="back" @click="router.push('/')">← 观察名单</button>

    <template v-if="company">
      <header class="header">
        <div>
          <h2>{{ company.name }}</h2>
          <span class="status">{{ STATUS_LABELS[company.status] }}</span>
        </div>
        <el-button v-if="company.status === 'investigating'" link @click="router.push('/sources')">
          信源库
        </el-button>
      </header>

      <el-alert
        v-if="company.status !== 'investigating'"
        type="info"
        :closable="false"
        show-icon
        title="请先在观察名单点击「开始深入调查」"
      />

      <template v-else-if="meta">
        <div class="card-surface questions">
          <h3>立项 · 待解问题（最多 3 个）</h3>
          <div class="q-list">
            <el-input
              v-for="(_, i) in meta.coreQuestions"
              :key="i"
              v-model="meta.coreQuestions[i]"
              :placeholder="`问题 ${i + 1}`"
            />
          </div>
          <el-button size="small" @click="saveQuestions">保存问题</el-button>
        </div>

        <el-tabs v-model="activeStage" @tab-change="onTabChange">
          <el-tab-pane
            v-for="s in STAGE_ORDER"
            :key="s"
            :label="STAGE_LABELS[s]"
            :name="s"
          />
        </el-tabs>

        <div class="layout">
          <div class="main-col">
            <ResearchLoopPanel
              :company-id="companyId"
              :stage="activeStage"
              :meta="meta"
              :supersede-target-id="supersedeId"
              @committed="loadEvidence"
              @update:meta="onMetaUpdate"
            />
            <div class="evidence-section">
              <div class="ev-header">
                <h3>本阶段证据</h3>
                <el-button
                  v-if="STAGE_ORDER.indexOf(activeStage) < STAGE_ORDER.length - 1"
                  size="small"
                  @click="nextStage"
                >
                  进入下一阶段 →
                </el-button>
              </div>
              <EvidenceList
                :items="evidence"
                :citations-map="citationsMap"
                @supersede="onSupersede"
                @remove="onRemove"
              />
            </div>
          </div>
        </div>
      </template>
    </template>

    <el-empty v-else description="未找到该公司" />
  </section>
</template>

<style scoped>
.workbench {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.back {
  background: none;
  border: none;
  color: var(--tesseract-muted);
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.header h2 {
  margin: 0 0 4px;
}
.status {
  color: var(--tesseract-muted);
  font-size: 14px;
}
.questions {
  padding: 16px 20px;
}
.questions h3 {
  margin: 0 0 12px;
  font-size: 15px;
}
.q-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.main-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.evidence-section h3 {
  margin: 0;
  font-size: 15px;
}
.ev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
</style>
