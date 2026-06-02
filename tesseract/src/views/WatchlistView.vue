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
import type { WatchlistCompany } from '../types'
import { STATUS_LABELS } from '../types'

const router = useRouter()
const companies = ref<WatchlistCompany[]>([])
const loading = ref(false)
const name = ref('')

async function load() {
  companies.value = await listCompanies()
}

async function add() {
  if (!name.value.trim()) {
    ElMessage.warning('请填写公司名称')
    return
  }
  loading.value = true
  try {
    await addCompany(name.value)
    name.value = ''
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
  <section class="page">
    <p class="intro">维护你的<strong>观察名单</strong>。列入之后，再决定是否开始深入调查。</p>

    <div class="card-surface add-panel">
      <h3 class="panel-title">加入名单</h3>
      <div class="add-row">
        <el-input
          v-model="name"
          size="large"
          placeholder="公司名称"
          clearable
          @keyup.enter="add"
        />
        <el-button type="primary" size="large" :loading="loading" @click="add">
          加入名单
        </el-button>
      </div>
    </div>

    <h3 class="section-title">观察名单</h3>

    <el-empty v-if="!companies.length" class="empty" description="暂无公司" />

    <ul v-else class="list">
      <li v-for="c in companies" :key="c.id" class="item card-surface">
        <div class="info">
          <button type="button" class="name" @click="openPlaceholder(c.id)">
            {{ c.name }}
          </button>
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
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.intro {
  color: var(--tesseract-muted);
  line-height: 1.7;
  margin: 0;
}
.add-panel {
  padding: 20px 22px;
}
.panel-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}
.add-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
}
.add-row .el-input {
  flex: 1;
}
.section-title {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 600;
}
.empty {
  padding: 32px 0;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 18px 20px;
}
.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}
.name {
  background: none;
  border: none;
  padding: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--tesseract-accent);
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
}
.status {
  margin: 0;
}
.ops {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
@media (max-width: 520px) {
  .add-row {
    flex-direction: column;
  }
  .add-row .el-button {
    width: 100%;
  }
}
</style>
