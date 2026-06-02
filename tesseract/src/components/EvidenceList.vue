<script setup lang="ts">
import type { Citation, Evidence } from '../types'
import { EPISTEMIC_LABELS } from '../types/research'

defineProps<{
  items: Evidence[]
  citationsMap: Record<string, Citation>
}>()

const emit = defineEmits<{
  supersede: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <div v-if="items.length" class="evidence-list">
    <article v-for="ev in items" :key="ev.id" class="evidence card-surface">
      <header class="ev-head">
        <el-tag size="small" type="info">{{ EPISTEMIC_LABELS[ev.epistemic] }}</el-tag>
        <span class="round">第 {{ ev.loopRound }} 轮</span>
      </header>
      <h4 class="claim">{{ ev.claim }}</h4>
      <p class="summary">{{ ev.summary }}</p>
      <p v-if="ev.falsifyIf" class="falsify"><strong>证伪：</strong>{{ ev.falsifyIf }}</p>
      <ul v-if="ev.citationIds.length" class="cites">
        <li v-for="cid in ev.citationIds" :key="cid">
          <a
            v-if="citationsMap[cid]"
            :href="citationsMap[cid].url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ citationsMap[cid].title }}
          </a>
          <span v-else class="missing">引用已丢失</span>
        </li>
      </ul>
      <div class="ev-actions">
        <el-button size="small" link type="primary" @click="emit('supersede', ev.id)">
          修订（新版取代）
        </el-button>
        <el-button size="small" link type="danger" @click="emit('remove', ev.id)">删除</el-button>
      </div>
    </article>
  </div>
  <p v-else class="empty">本阶段尚无沉淀证据。完成循环第 4 步「沉淀」后显示在这里。</p>
</template>

<style scoped>
.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.evidence {
  padding: 16px;
}
.ev-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.round {
  font-size: 12px;
  color: var(--tesseract-muted);
}
.claim {
  margin: 0 0 8px;
  font-size: 15px;
  line-height: 1.5;
}
.summary {
  margin: 0 0 8px;
  color: var(--tesseract-text);
  line-height: 1.6;
  font-size: 14px;
}
.falsify {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--tesseract-warning);
}
.cites {
  margin: 0 0 8px;
  padding-left: 18px;
  font-size: 13px;
}
.cites a {
  color: var(--tesseract-accent);
  word-break: break-all;
}
.missing {
  color: var(--tesseract-negative);
}
.ev-actions {
  display: flex;
  gap: 8px;
}
.empty {
  color: var(--tesseract-muted);
  font-size: 14px;
  margin: 0;
}
</style>
