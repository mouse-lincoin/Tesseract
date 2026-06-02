<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  runAutoLoopChain,
  runAutoRound,
  runAutoAllStages,
  type RunAutoRoundOutput,
} from '../services/ai/autoResearch'
import type { ResearchMeta, ResearchStage } from '../types'
import { STAGE_LABELS } from '../types/research'

const props = defineProps<{
  companyId: string
  stage: ResearchStage
  meta: ResearchMeta
}>()

const emit = defineEmits<{
  done: []
}>()

const loading = ref(false)
const log = ref<string[]>([])

function pushLog(line: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${line}`, ...log.value].slice(0, 20)
}

async function runOne(continueFromPrior: boolean) {
  loading.value = true
  try {
    const out = await runAutoRound(props.companyId, props.stage, { continueFromPrior })
    reportRound(out)
    ElMessage.success(`第 ${out.loopRound} 轮已完成并入库`)
    emit('done')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : 'AI 调研失败')
  } finally {
    loading.value = false
  }
}

async function runChain() {
  loading.value = true
  log.value = []
  try {
    const rounds = await runAutoLoopChain(props.companyId, props.stage, 3)
    rounds.forEach(reportRound)
    ElMessage.success(`本阶段共完成 ${rounds.length} 轮 AI 调研`)
    emit('done')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : 'AI 调研失败')
  } finally {
    loading.value = false
  }
}

async function runAll() {
  loading.value = true
  log.value = []
  try {
    const all = await runAutoAllStages(props.companyId, 2)
    let total = 0
    for (const { stage, rounds } of all) {
      pushLog(`${STAGE_LABELS[stage]}：${rounds.length} 轮`)
      total += rounds.length
    }
    ElMessage.success(`全阶段 AI 调研完成，共 ${total} 轮`)
    emit('done')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : 'AI 调研失败')
  } finally {
    loading.value = false
  }
}

function reportRound(out: RunAutoRoundOutput) {
  pushLog(
    `第${out.loopRound}轮：沉淀 ${out.createdEvidenceIds.length} 条；建议继续=${out.continueLoop}`,
  )
}
</script>

<template>
  <div class="ai-panel card-surface">
    <h3>AI 全自动调研（DeepSeek）</h3>
    <p class="hint">
      自动完成定向→收集→推敲→沉淀并写入证据库。可在已有调研基础上继续 Loop。
      <router-link to="/settings">配置 API Key</router-link>
    </p>
    <div class="actions">
      <el-button type="primary" :loading="loading" @click="runOne(false)">
        AI 执行本轮
      </el-button>
      <el-button :loading="loading" @click="runOne(true)">AI 继续下一轮</el-button>
      <el-button :loading="loading" @click="runChain">本阶段连续 Loop（最多 3 轮）</el-button>
      <el-button :loading="loading" type="warning" plain @click="runAll">
        全阶段自动调研
      </el-button>
    </div>
    <ul v-if="log.length" class="log">
      <li v-for="(line, i) in log" :key="i">{{ line }}</li>
    </ul>
  </div>
</template>

<style scoped>
.ai-panel {
  padding: 18px 20px;
}
h3 {
  margin: 0 0 8px;
  font-size: 15px;
}
.hint {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--tesseract-muted);
  line-height: 1.6;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.log {
  margin: 14px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--tesseract-muted);
  line-height: 1.6;
}
</style>
