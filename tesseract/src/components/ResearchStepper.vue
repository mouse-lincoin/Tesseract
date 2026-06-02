<script setup lang="ts">
import type { ResearchStage } from '../types/research'
import { RESEARCH_STAGES, STAGE_LABELS } from '../types/research'

defineProps<{
  current: ResearchStage
}>()

const emit = defineEmits<{
  select: [stage: ResearchStage]
}>()
</script>

<template>
  <ol class="stepper">
    <li
      v-for="stage in RESEARCH_STAGES"
      :key="stage"
      class="step"
      :class="{ active: stage === current, done: RESEARCH_STAGES.indexOf(stage) < RESEARCH_STAGES.indexOf(current) }"
    >
      <button type="button" class="step-btn" @click="emit('select', stage)">
        <span class="dot" />
        <span class="label">{{ STAGE_LABELS[stage] }}</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.stepper {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
}
.step {
  flex: 1 1 80px;
  min-width: 72px;
}
.step-btn {
  width: 100%;
  background: none;
  border: none;
  color: var(--tesseract-muted);
  cursor: pointer;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.step.active .step-btn {
  color: var(--tesseract-accent);
}
.step.done .dot {
  background: var(--tesseract-positive);
  border-color: var(--tesseract-positive);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--tesseract-border);
  background: var(--tesseract-surface);
}
.step.active .dot {
  border-color: var(--tesseract-accent);
  background: var(--tesseract-accent);
}
.label {
  line-height: 1.3;
  text-align: center;
}
</style>
