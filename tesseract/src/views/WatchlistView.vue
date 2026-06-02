<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { companiesRepo } from '../db'
import { addCompanyToWatchlist, listWatchlist, removeFromWatchlist } from '../services/watchlist'
import type { Company, Market, WatchlistItem } from '../types'
import { STAGE_LABELS } from '../types/research'

const router = useRouter()
const items = ref<WatchlistItem[]>([])
const companies = ref<Record<string, Company>>({})
const loading = ref(false)

const form = ref({
  name: '',
  code: '',
  market: '港股' as Market,
  industryIds: 'SaaS / 企业软件',
})

async function load() {
  items.value = await listWatchlist()
  const map: Record<string, Company> = {}
  for (const item of items.value) {
    const c = await companiesRepo.get(item.companyId)
    if (c) map[c.id] = c
  }
  companies.value = map
}

async function add() {
  if (!form.value.name.trim() || !form.value.code.trim()) {
    ElMessage.warning('请填写公司名称与代码')
    return
  }
  loading.value = true
  try {
    const { item, created } = await addCompanyToWatchlist({
      name: form.value.name,
      code: form.value.code,
      market: form.value.market,
      industryIds: form.value.industryIds.split(/[,，]/).map((s) => s.trim()),
    })
    await load()
    if (created) {
      ElMessage.success('已加入观察名单')
      router.push(`/research/${item.id}`)
    } else {
      ElMessage.info('已在观察名单中')
      router.push(`/research/${item.id}`)
    }
    form.value.name = ''
    form.value.code = ''
  } finally {
    loading.value = false
  }
}

async function remove(id: string) {
  await removeFromWatchlist(id)
  ElMessage.success('已移出观察名单')
  await load()
}

function openResearch(id: string) {
  router.push(`/research/${id}`)
}

onMounted(load)
</script>

<template>
  <section>
    <p class="intro">
      像研究员一样维护<strong>观察名单</strong>：先列入，再分阶段深入研究。不追求一次出结论，而是逐步弄清关键限制因素与发展因素。
    </p>

    <div class="card-surface add-panel">
      <h3>加入观察名单</h3>
      <div class="form-grid">
        <el-input v-model="form.name" placeholder="公司名称" />
        <el-input v-model="form.code" placeholder="股票代码，如 0268.HK" />
        <el-select v-model="form.market" style="width: 100%">
          <el-option label="港股" value="港股" />
          <el-option label="A股" value="A股" />
        </el-select>
        <el-input v-model="form.industryIds" placeholder="行业（逗号分隔）" />
      </div>
      <el-button type="primary" :loading="loading" @click="add">列入并开始研究</el-button>
    </div>

    <h3 class="section-title">我的观察名单</h3>
    <el-empty v-if="!items.length" description="尚无标的；加入后开始第一步「列入观察」" />

    <ul v-else class="watch-list">
      <li v-for="item in items" :key="item.id" class="watch-item card-surface">
        <div class="info" @click="openResearch(item.id)">
          <strong>{{ companies[item.companyId]?.name ?? '—' }}</strong>
          <span class="meta">
            {{ companies[item.companyId]?.code }}
            · {{ STAGE_LABELS[item.stage] }}
          </span>
          <p v-if="item.hypothesis.keyConstraint" class="teaser">
            假设：{{ item.hypothesis.keyConstraint }}
          </p>
        </div>
        <div class="ops">
          <el-button type="primary" link @click="openResearch(item.id)">继续研究</el-button>
          <el-button type="danger" link @click="remove(item.id)">移出</el-button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.intro {
  color: var(--tesseract-muted);
  line-height: 1.7;
  margin: 0 0 24px;
}
.add-panel h3,
.section-title {
  margin: 0 0 12px;
  font-size: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.watch-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.watch-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.info {
  flex: 1;
  cursor: pointer;
}
.meta {
  display: block;
  color: var(--tesseract-muted);
  font-size: 13px;
  margin-top: 4px;
}
.teaser {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--tesseract-text);
  opacity: 0.9;
}
.ops {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
</style>
