<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { rulesRepo } from '../db'
import type { Rule } from '../types'

const rules = ref<Rule[]>([])
const dialogVisible = ref(false)
const editing = ref<Rule | null>(null)

const form = ref<Rule>({
  id: '',
  industry: '',
  constraintName: '',
  proxyMetric: '',
  threshold: undefined,
  description: '',
})

async function load() {
  rules.value = await rulesRepo.getAll()
}

function openCreate() {
  editing.value = null
  form.value = {
    id: `rule-${Date.now()}`,
    industry: 'SaaS / 企业软件',
    constraintName: '',
    proxyMetric: '',
    threshold: undefined,
    description: '',
  }
  dialogVisible.value = true
}

function openEdit(rule: Rule) {
  editing.value = rule
  form.value = { ...rule }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.industry || !form.value.constraintName || !form.value.proxyMetric) {
    ElMessage.warning('请填写行业、关键限制因素与代理指标')
    return
  }
  await rulesRepo.put({ ...form.value })
  ElMessage.success('规则已保存')
  dialogVisible.value = false
  await load()
}

async function remove(rule: Rule) {
  await rulesRepo.delete(rule.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>

<template>
  <section>
    <div class="toolbar">
      <p class="intro">公理库：各行业关键限制因素及其代理指标（JSON 友好，可扩展）。</p>
      <el-button type="primary" @click="openCreate">新增规则</el-button>
    </div>

    <el-table :data="rules" class="rules-table" stripe>
      <el-table-column prop="industry" label="行业" min-width="140" />
      <el-table-column prop="constraintName" label="关键限制因素" min-width="120" />
      <el-table-column prop="proxyMetric" label="代理指标" min-width="160" />
      <el-table-column label="参考线" width="90">
        <template #default="{ row }">
          {{ row.threshold != null ? `${row.threshold}%` : '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editing ? '编辑规则' : '新增规则'"
      width="520px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="行业">
          <el-input v-model="form.industry" />
        </el-form-item>
        <el-form-item label="关键限制因素">
          <el-input v-model="form.constraintName" />
        </el-form-item>
        <el-form-item label="代理指标">
          <el-input v-model="form.proxyMetric" />
        </el-form-item>
        <el-form-item label="参考阈值（可选，%）">
          <el-input-number v-model="form.threshold" :min="0" :max="500" :step="1" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.intro {
  margin: 0;
  color: var(--tesseract-muted);
  max-width: 520px;
  line-height: 1.6;
}
.rules-table {
  width: 100%;
}
</style>
