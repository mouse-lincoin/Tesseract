<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  addCompany,
  listCompanies,
  removeCompany,
  startInvestigation,
} from '../services/companies'
import type { Market, WatchlistCompany } from '../types'
import { STATUS_LABELS } from '../types'

const router = useRouter()
const companies = ref<WatchlistCompany[]>([])
const loading = ref(false)

const form = ref({
  name: '',
  code: '',
  market: '港股' as Market,
})

async function load() {
  companies.value = await listCompanies()
}

async function add() {
  if (!form.value.name.trim() || !form.value.code.trim()) {
    ElMessage.warning('请填写公司名称与代码')
    return
  }
  loading.value = true
  try {
    await addCompany({
      name: form.value.name,
      code: form.value.code,
      market: form.value.market,
    })
    form.value.name = ''
    form.value.code = ''
    ElMessage.success('已加入观察名单')
    await load()
  } finally {
    loading.value = false
  }
}

async function investigate(id: string) {
  loading.value = true
  try {
    await startInvestigation(id)
    ElMessage.success('已开始深入调查')
    await load()
  } finally {
    loading.value = false
  }
}

async function remove(id: string) {
  await removeCompany(id)
  ElMessage.success('已移出名单')
  await load()
}

function openPlaceholder(id: string) {
  router.push(`/company/${id}`)
}

onMounted(load)
</script>

<template>
  <section>
    <p class="intro">维护你的<strong>观察名单</strong>。列入之后，再决定是否开始深入调查。</p>

    <div class="card-surface add-panel">
      <h3>加入名单</h3>
      <div class="form-grid">
        <el-input v-model="form.name" placeholder="公司名称" />
        <el-input v-model="form.code" placeholder="股票代码，如 0268.HK" />
        <el-select v-model="form.market" style="width: 100%">
          <el-option label="港股" value="港股" />
          <el-option label="A股" value="A股" />
        </el-select>
      </div>
      <el-button type="primary" :loading="loading" @click="add">加入名单</el-button>
    </div>

    <h3 class="section-title">观察名单</h3>
    <el-empty v-if="!companies.length" description="暂无公司" />

    <ul v-else class="list">
      <li v-for="c in companies" :key="c.id" class="item card-surface">
        <div class="info">
          <button type="button" class="name" @click="openPlaceholder(c.id)">
            {{ c.name }}
          </button>
          <span class="meta">{{ c.code }} · {{ c.market }}</span>
          <el-tag
            :type="c.status === 'investigating' ? 'warning' : 'info'"
            size="small"
            class="status"
          >
            {{ STATUS_LABELS[c.status] }}
          </el-tag>
        </div>
        <div class="ops">
          <el-button
            v-if="c.status === 'on_list'"
            type="primary"
            :loading="loading"
            @click="investigate(c.id)"
          >
            开始深入调查
          </el-button>
          <el-button type="danger" link @click="remove(c.id)">移出</el-button>
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
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.name {
  background: none;
  border: none;
  padding: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--tesseract-accent);
  cursor: pointer;
  text-align: left;
}
.meta {
  display: block;
  color: var(--tesseract-muted);
  font-size: 13px;
  margin-top: 4px;
}
.status {
  margin-top: 8px;
}
.ops {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
