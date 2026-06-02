<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ConstraintCard from '../components/ConstraintCard.vue'
import DiscussionPanel from '../components/DiscussionPanel.vue'
import ResearchStepper from '../components/ResearchStepper.vue'
import { companiesRepo } from '../db'
import {
  listMessages,
  requestSearchBrief,
  sendUserMessage,
  startStageDialogue,
} from '../services/discuss'
import { getAiSettings, isAiConfigured } from '../services/aiSettings'
import { loadEvidenceSnapshot, nextStage, prevStage } from '../services/research'
import {
  getWatchlistItem,
  setWatchlistStage,
  updateWatchlistItem,
} from '../services/watchlist'
import type { AnalyzeResult, Company, DiscussionMessage, WatchlistItem } from '../types'
import type { ResearchStage } from '../types/research'
import { STAGE_HINTS, STAGE_LABELS } from '../types/research'

const route = useRoute()
const router = useRouter()

const item = ref<WatchlistItem | null>(null)
const company = ref<Company | null>(null)
const messages = ref<DiscussionMessage[]>([])
const evidence = ref<AnalyzeResult | null>(null)
const chatLoading = ref(false)
const aiReady = ref(false)
const growthInput = ref('')
const openQuestionsInput = ref('')

const watchlistId = computed(() => route.params.id as string)

async function load() {
  const w = await getWatchlistItem(watchlistId.value)
  if (!w) {
    ElMessage.error('未找到该观察项')
    router.push('/')
    return
  }
  item.value = w
  company.value = (await companiesRepo.get(w.companyId)) ?? null
  messages.value = await listMessages(w.id)
  growthInput.value = (w.hypothesis.growthDrivers ?? []).join('\n')
  openQuestionsInput.value = (w.hypothesis.openQuestions ?? []).join('\n')
  aiReady.value = isAiConfigured(await getAiSettings())

  if (w.stage === 'evidence' && company.value) {
    evidence.value = await loadEvidenceSnapshot(company.value.name)
  } else {
    evidence.value = null
  }
}

async function saveItem() {
  if (!item.value) return
  await updateWatchlistItem(item.value)
  ElMessage.success('已保存')
}

async function goStage(stage: ResearchStage) {
  if (!item.value) return
  await setWatchlistStage(item.value, stage)
  await load()
}

async function advance() {
  if (!item.value) return
  const n = nextStage(item.value.stage)
  if (!n) return
  await setWatchlistStage(item.value, n)
  await load()
}

async function back() {
  if (!item.value) return
  const p = prevStage(item.value.stage)
  if (!p) return
  await setWatchlistStage(item.value, p)
  await load()
}

async function onSend(text: string) {
  if (!item.value) return
  chatLoading.value = true
  try {
    messages.value = await sendUserMessage(item.value, text)
    await load()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '发送失败')
  } finally {
    chatLoading.value = false
  }
}

async function onSearchBrief() {
  if (!item.value) return
  chatLoading.value = true
  try {
    await requestSearchBrief(item.value)
    messages.value = await listMessages(item.value.id)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '请求失败')
  } finally {
    chatLoading.value = false
  }
}

async function onStageKickoff() {
  if (!item.value) return
  chatLoading.value = true
  try {
    messages.value = await startStageDialogue(item.value)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '对话失败')
  } finally {
    chatLoading.value = false
  }
}

function syncHypothesisFields() {
  if (!item.value) return
  item.value.hypothesis.growthDrivers = growthInput.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  item.value.hypothesis.openQuestions = openQuestionsInput.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

watch(watchlistId, load)
onMounted(load)
</script>

<template>
  <section v-if="item && company" class="workspace">
    <header class="ws-header">
      <div>
        <button type="button" class="back" @click="router.push('/')">← 观察名单</button>
        <h2>{{ company.name }}</h2>
        <span class="code">{{ company.code }} · {{ company.market }}</span>
      </div>
      <div class="nav-stage">
        <el-button v-if="prevStage(item.stage)" @click="back">上一阶段</el-button>
        <el-button v-if="nextStage(item.stage)" type="primary" @click="advance">
          进入{{ STAGE_LABELS[nextStage(item.stage)!] }}
        </el-button>
      </div>
    </header>

    <ResearchStepper :current="item.stage" @select="goStage" />

    <p class="stage-hint">{{ STAGE_HINTS[item.stage] }}</p>

    <div class="layout">
      <div class="main">
        <!-- 列入观察 -->
        <div v-if="item.stage === 'listed'" class="card-surface stage-panel">
          <h3>列入观察</h3>
          <p>先记录你为什么关注这家公司，不急于判断好坏。</p>
          <el-input
            v-model="item.statusNote"
            type="textarea"
            :rows="4"
            placeholder="关注理由、初始疑问、需要警惕的偏见…"
          />
          <el-button type="primary" @click="saveItem">保存备注</el-button>
        </div>

        <!-- 业务厘清 -->
        <div v-else-if="item.stage === 'scoping'" class="card-surface stage-panel">
          <h3>业务厘清</h3>
          <el-input
            v-model="item.statusNote"
            type="textarea"
            :rows="5"
            placeholder="主营业务、收入构成、客户类型、与公理库行业的匹配度…"
          />
          <el-button type="primary" @click="saveItem">保存</el-button>
        </div>

        <!-- 提出假设 -->
        <div v-else-if="item.stage === 'hypothesis'" class="card-surface stage-panel">
          <h3>提出假设（可被推翻）</h3>
          <el-form label-position="top">
            <el-form-item label="关键限制因素（生死线）候选">
              <el-input
                v-model="item.hypothesis.keyConstraint"
                type="textarea"
                :rows="2"
                placeholder="例如：客户流失是否才是当前阶段的生死线？"
              />
            </el-form-item>
            <el-form-item label="发展因素（每行一条）">
              <el-input
                v-model="growthInput"
                type="textarea"
                :rows="4"
                placeholder="例如：云转型占比提升；大客户续约率改善…"
                @blur="syncHypothesisFields"
              />
            </el-form-item>
            <el-form-item label="待解问题（每行一条）">
              <el-input
                v-model="openQuestionsInput"
                type="textarea"
                :rows="3"
                placeholder="还有哪些事实不清楚？"
              />
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="syncHypothesisFields(); saveItem()">保存假设</el-button>
        </div>

        <!-- 核对证据 -->
        <div v-else-if="item.stage === 'evidence'" class="stage-panel">
          <p class="evidence-note card-surface">
            以下为公理库匹配的代理指标对照，<strong>仅供参考</strong>；缺数据处请回到讨论区标注【未知】，勿脑补。
          </p>
          <template v-if="evidence?.constraints.length">
            <ConstraintCard
              v-for="c in evidence.constraints"
              :key="c.rule.id"
              :result="c"
              :company-name="company.name"
            />
          </template>
          <el-empty v-else description="暂无指标数据，请至「数据」页录入" />
        </div>

        <!-- 人机讨论 -->
        <div v-else-if="item.stage === 'discuss'" class="card-surface stage-panel">
          <h3>人机讨论</h3>
          <p>
            右侧讨论区是核心。请主动质疑 AI 的回答；AI 被设定为<strong>不讨好</strong>，会挑战你的假设。
          </p>
        </div>

        <!-- 本质总结 -->
        <div v-else-if="item.stage === 'synthesis'" class="card-surface stage-panel">
          <h3>本质总结（你的判断）</h3>
          <el-form label-position="top">
            <el-form-item label="关键限制因素（成稿）">
              <el-input v-model="item.synthesis.keyConstraint" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="发展因素（成稿，每行一条）">
              <el-input
                :model-value="(item.synthesis.growthFactors ?? []).join('\n')"
                type="textarea"
                :rows="3"
                @update:model-value="
                  (v: string) =>
                    (item!.synthesis.growthFactors = v.split('\n').map((s) => s.trim()).filter(Boolean))
                "
              />
            </el-form-item>
            <el-form-item label="仍不确定之处">
              <el-input
                :model-value="(item.synthesis.uncertainties ?? []).join('\n')"
                type="textarea"
                :rows="2"
                @update:model-value="
                  (v: string) =>
                    (item!.synthesis.uncertainties = v.split('\n').map((s) => s.trim()).filter(Boolean))
                "
              />
            </el-form-item>
            <el-form-item label="本质总结（一段话，区分事实与推断）">
              <el-input v-model="item.synthesis.essence" type="textarea" :rows="6" />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="item.synthesis.finalized">标记为成稿（仍可修改）</el-checkbox>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="saveItem">保存总结</el-button>
        </div>
      </div>

      <DiscussionPanel
        class="side"
        :messages="messages"
        :loading="chatLoading"
        :ai-ready="aiReady"
        @send="onSend"
        @search-brief="onSearchBrief"
        @stage-kickoff="onStageKickoff"
      />
    </div>
  </section>
</template>

<style scoped>
.workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ws-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.back {
  background: none;
  border: none;
  color: var(--tesseract-muted);
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
  font-size: 13px;
}
.ws-header h2 {
  margin: 0;
  font-size: 22px;
}
.code {
  color: var(--tesseract-muted);
  font-size: 14px;
}
.nav-stage {
  display: flex;
  gap: 8px;
}
.stage-hint {
  margin: 0;
  color: var(--tesseract-muted);
  font-size: 14px;
  line-height: 1.6;
}
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 900px) {
  .layout {
    grid-template-columns: 1fr 340px;
  }
}
.stage-panel h3 {
  margin: 0 0 8px;
}
.stage-panel p {
  color: var(--tesseract-muted);
  line-height: 1.6;
}
.evidence-note {
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
}
</style>
