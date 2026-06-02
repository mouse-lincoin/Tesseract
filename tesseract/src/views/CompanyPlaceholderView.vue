<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCompany } from '../services/companies'
import type { WatchlistCompany } from '../types'
import { STATUS_LABELS } from '../types'

const route = useRoute()
const router = useRouter()
const company = ref<WatchlistCompany | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  company.value = (await getCompany(id)) ?? null
})
</script>

<template>
  <section class="placeholder">
    <button type="button" class="back" @click="router.push('/')">← 返回观察名单</button>

    <template v-if="company">
      <h2>{{ company.name }}</h2>
      <p class="meta">{{ company.code }} · {{ company.market }}</p>
      <p class="status">当前状态：{{ STATUS_LABELS[company.status] }}</p>
      <div class="card-surface note">
        <p>公司详情页尚未设计，后续会在这里展开研究过程与结论。</p>
      </div>
    </template>

    <el-empty v-else description="未找到该公司" />
  </section>
</template>

<style scoped>
.placeholder {
  max-width: 560px;
}
.back {
  background: none;
  border: none;
  color: var(--tesseract-muted);
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
}
h2 {
  margin: 0 0 8px;
}
.meta,
.status {
  color: var(--tesseract-muted);
  margin: 0 0 8px;
}
.note {
  margin-top: 24px;
  line-height: 1.7;
  color: var(--tesseract-muted);
}
.note p {
  margin: 0;
}
</style>
