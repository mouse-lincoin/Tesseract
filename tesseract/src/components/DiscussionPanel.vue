<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { DiscussionMessage } from '../types'

const props = defineProps<{
  messages: DiscussionMessage[]
  loading?: boolean
  aiReady: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  searchBrief: []
  stageKickoff: []
}>()

const draft = ref('')
const listRef = ref<HTMLElement | null>(null)

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  },
)

function submit() {
  const text = draft.value.trim()
  if (!text || props.loading) return
  emit('send', text)
  draft.value = ''
}

function roleLabel(role: DiscussionMessage['role']): string {
  if (role === 'user') return '你'
  if (role === 'assistant') return 'AI'
  return '系统'
}
</script>

<template>
  <div class="discussion card-surface">
    <header class="disc-header">
      <h3>研究讨论</h3>
      <p class="hint">
        AI 负责提出反证与检索方向；你负责判断与修正。未配置 API 时仅保存你的记录。
      </p>
    </header>

    <div ref="listRef" class="messages">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="msg"
        :class="[msg.role, msg.kind]"
      >
        <span class="role">{{ roleLabel(msg.role) }}</span>
        <pre class="body">{{ msg.content }}</pre>
      </div>
      <p v-if="!messages.length" class="empty">尚无讨论。可发起本阶段对话，或先让 AI 列出检索方向。</p>
    </div>

    <div class="actions">
      <el-button size="small" :disabled="loading" @click="emit('searchBrief')">
        AI 检索方向
      </el-button>
      <el-button size="small" :disabled="loading || !aiReady" @click="emit('stageKickoff')">
        本阶段开场
      </el-button>
    </div>

    <div class="composer">
      <el-input
        v-model="draft"
        type="textarea"
        :rows="3"
        placeholder="写下你的观察、质疑或检索结果…"
        :disabled="loading"
        @keydown.ctrl.enter.prevent="submit"
      />
      <el-button type="primary" :loading="loading" @click="submit">发送</el-button>
    </div>
  </div>
</template>

<style scoped>
.discussion {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 320px;
}
.disc-header h3 {
  margin: 0 0 4px;
  font-size: 15px;
}
.hint {
  margin: 0;
  font-size: 12px;
  color: var(--tesseract-muted);
  line-height: 1.5;
}
.messages {
  flex: 1;
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}
.msg {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--tesseract-border);
}
.msg.user {
  border-color: rgba(88, 166, 255, 0.35);
}
.msg.assistant {
  border-color: rgba(63, 185, 80, 0.25);
}
.msg.system {
  opacity: 0.85;
  font-size: 13px;
}
.role {
  display: block;
  font-size: 11px;
  color: var(--tesseract-muted);
  margin-bottom: 6px;
}
.body {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}
.empty {
  color: var(--tesseract-muted);
  font-size: 13px;
  text-align: center;
  margin: 24px 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
