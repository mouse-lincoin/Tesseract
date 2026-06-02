<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { EpistemicType, ResearchMeta, ResearchStage } from '../types'
import {
  EPISTEMIC_LABELS,
  LOOP_LABELS,
  STAGE_GUIDES,
  type LoopStep,
} from '../types/research'
import { createCitation, createEvidence } from '../services/evidence'
import { bumpLoopRound, currentLoopRound, updateResearchMeta } from '../services/research'
import { addTrustedSource } from '../services/trustedSources'

const props = defineProps<{
  companyId: string
  stage: ResearchStage
  meta: ResearchMeta
  supersedeTargetId?: string
}>()

const emit = defineEmits<{
  committed: []
  'update:meta': [ResearchMeta]
}>()

const step = ref<LoopStep>('orient')
const orientText = ref('')
const collectUrls = ref('')
const challengeChecks = ref({
  hasCitation: false,
  falsify: false,
  noLeap: false,
  hasCounter: false,
})
const commitForm = ref({
  claim: '',
  epistemic: 'fact' as EpistemicType,
  summary: '',
  falsifyIf: '',
  citeUrl: '',
  citeTitle: '',
  citeExcerpt: '',
})
const pendingCitationIds = ref<string[]>([])

const round = computed(() => currentLoopRound(props.meta, props.stage))

watch(
  () => [props.stage, props.meta],
  () => {
    orientText.value = props.meta.orientNote[props.stage] ?? ''
    step.value = 'orient'
    resetCommit()
  },
  { deep: true },
)

watch(
  () => props.supersedeTargetId,
  (id) => {
    if (id) step.value = 'commit'
  },
)

function resetCommit() {
  commitForm.value = {
    claim: '',
    epistemic: 'fact',
    summary: '',
    falsifyIf: '',
    citeUrl: '',
    citeTitle: '',
    citeExcerpt: '',
  }
  pendingCitationIds.value = []
}

async function saveOrient() {
  props.meta.orientNote[props.stage] = orientText.value
  await updateResearchMeta(props.meta)
  emit('update:meta', props.meta)
  step.value = 'collect'
}

async function addCitationFromForm(): Promise<string | null> {
  const url = commitForm.value.citeUrl.trim()
  if (!url) return null
  try {
    const c = await createCitation({
      companyId: props.companyId,
      url,
      title: commitForm.value.citeTitle || url,
      excerpt: commitForm.value.citeExcerpt,
    })
    pendingCitationIds.value.push(c.id)
    commitForm.value.citeUrl = ''
    commitForm.value.citeTitle = ''
    commitForm.value.citeExcerpt = ''
    return c.id
  } catch {
    ElMessage.error('URL 无效')
    return null
  }
}

async function saveCollect() {
  const lines = collectUrls.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  for (const url of lines) {
    const c = await createCitation({
      companyId: props.companyId,
      url,
      title: url,
    })
    pendingCitationIds.value.push(c.id)
  }
  collectUrls.value = ''
  step.value = 'challenge'
}

function passChallenge(): boolean {
  const c = challengeChecks.value
  if (commitForm.value.epistemic === 'fact' && !c.hasCitation) {
    ElMessage.warning('【事实】需勾选「有引用」')
    return false
  }
  if (!c.falsify && commitForm.value.epistemic !== 'unknown') {
    ElMessage.warning('请确认已考虑证伪条件，或改用【未知】')
    return false
  }
  return true
}

function goCommit() {
  if (!passChallenge()) return
  step.value = 'commit'
}

async function submitEvidence() {
  if (!commitForm.value.claim.trim() || !commitForm.value.summary.trim()) {
    ElMessage.warning('请填写主张与摘要')
    return
  }
  if (commitForm.value.epistemic === 'fact') {
    if (!pendingCitationIds.value.length && !(await addCitationFromForm())) {
      ElMessage.warning('【事实】至少添加 1 条引用')
      return
    } else if (commitForm.value.citeUrl.trim()) {
      await addCitationFromForm()
    }
  }

  try {
    await createEvidence({
      companyId: props.companyId,
      stage: props.stage,
      loopRound: round.value,
      claim: commitForm.value.claim,
      epistemic: commitForm.value.epistemic,
      summary: commitForm.value.summary,
      citationIds: [...pendingCitationIds.value],
      falsifyIf: commitForm.value.falsifyIf,
      supersedesId: props.supersedeTargetId,
    })
    ElMessage.success('证据已沉淀')
    resetCommit()
    challengeChecks.value = { hasCitation: false, falsify: false, noLeap: false, hasCounter: false }
    await bumpLoopRound(props.meta, props.stage)
    emit('update:meta', props.meta)
    emit('committed')
    step.value = 'orient'
    orientText.value = ''
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败')
  }
}

async function addUrlToTrusted(url: string) {
  if (!url.trim()) return
  await addTrustedSource({
    url: url.trim(),
    label: url.trim(),
    tags: [],
    note: '从调研收集中标记',
    companyId: props.companyId,
  })
  ElMessage.success('已加入信源库')
}
</script>

<template>
  <div class="loop card-surface">
    <div class="loop-steps">
      <button
        v-for="s in (['orient', 'collect', 'challenge', 'commit'] as LoopStep[])"
        :key="s"
        type="button"
        class="step-pill"
        :class="{ active: step === s }"
        @click="step = s"
      >
        {{ LOOP_LABELS[s] }}
      </button>
      <span class="round-badge">第 {{ round }} 轮</span>
    </div>

    <ul class="guides">
      <li v-for="(g, i) in STAGE_GUIDES[stage]" :key="i">{{ g }}</li>
    </ul>

    <div v-show="step === 'orient'" class="panel">
      <p class="hint">本轮要验证什么？与哪条假设相关？</p>
      <el-input v-model="orientText" type="textarea" :rows="3" placeholder="写下本轮定向…" />
      <el-button type="primary" @click="saveOrient">保存并进入收集</el-button>
    </div>

    <div v-show="step === 'collect'" class="panel">
      <p class="hint">粘贴待查 URL（每行一个）；全文不保存，只留引用。</p>
      <el-input v-model="collectUrls" type="textarea" :rows="4" placeholder="https://…" />
      <div class="row">
        <el-button type="primary" @click="saveCollect">保存引用并进入推敲</el-button>
      </div>
    </div>

    <div v-show="step === 'challenge'" class="panel">
      <p class="hint">沉淀前自检（推敲过关再写入证据卡片）</p>
      <el-checkbox v-model="challengeChecks.hasCitation">【事实】已有 ≥1 条引用</el-checkbox>
      <el-checkbox v-model="challengeChecks.falsify">已写或可写证伪条件</el-checkbox>
      <el-checkbox v-model="challengeChecks.noLeap">结论无明显叙事跳跃</el-checkbox>
      <el-checkbox v-model="challengeChecks.hasCounter">已考虑反证或替代解释</el-checkbox>
      <el-button type="primary" @click="goCommit">进入沉淀</el-button>
    </div>

    <div v-show="step === 'commit'" class="panel">
      <p v-if="supersedeTargetId" class="warn">正在修订旧证据，提交后将取代原卡片。</p>
      <el-form label-position="top">
        <el-form-item label="主张（一句）">
          <el-input v-model="commitForm.claim" />
        </el-form-item>
        <el-form-item label="认知类型">
          <el-select v-model="commitForm.epistemic">
            <el-option
              v-for="(label, key) in EPISTEMIC_LABELS"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要（2–5 句）">
          <el-input v-model="commitForm.summary" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="证伪条件（可选）">
          <el-input v-model="commitForm.falsifyIf" placeholder="若出现…则本主张不成立" />
        </el-form-item>
        <el-form-item label="添加引用">
          <el-input v-model="commitForm.citeUrl" placeholder="URL" />
          <el-input v-model="commitForm.citeTitle" placeholder="标题（可选）" class="mt" />
          <el-input
            v-model="commitForm.citeExcerpt"
            type="textarea"
            :rows="2"
            placeholder="关键一句摘录（可选）"
            class="mt"
          />
          <div class="row mt">
            <el-button @click="addCitationFromForm">添加引用</el-button>
            <el-button
              v-if="commitForm.citeUrl"
              link
              type="primary"
              @click="addUrlToTrusted(commitForm.citeUrl)"
            >
              加入信源库
            </el-button>
          </div>
        </el-form-item>
        <p v-if="pendingCitationIds.length" class="pending">
          已挂接 {{ pendingCitationIds.length }} 条引用
        </p>
      </el-form>
      <el-button type="primary" @click="submitEvidence">沉淀证据</el-button>
    </div>
  </div>
</template>

<style scoped>
.loop {
  padding: 18px 20px;
}
.loop-steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.step-pill {
  border: 1px solid var(--tesseract-border);
  background: transparent;
  color: var(--tesseract-muted);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
}
.step-pill.active {
  border-color: var(--tesseract-accent);
  color: var(--tesseract-accent);
  background: rgba(88, 166, 255, 0.1);
}
.round-badge {
  margin-left: auto;
  font-size: 12px;
  color: var(--tesseract-muted);
}
.guides {
  margin: 0 0 16px;
  padding-left: 18px;
  color: var(--tesseract-muted);
  font-size: 13px;
  line-height: 1.6;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hint {
  margin: 0;
  font-size: 13px;
  color: var(--tesseract-muted);
  line-height: 1.5;
}
.warn {
  margin: 0;
  color: var(--tesseract-warning);
  font-size: 13px;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.mt {
  margin-top: 8px;
}
.pending {
  margin: 0;
  font-size: 13px;
  color: var(--tesseract-positive);
}
</style>
