<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ConstraintCard from '../components/ConstraintCard.vue'
import { analyzeCompany } from '../services/analyze'
import type { AnalyzeResult } from '../types'

const query = ref('金蝶国际')
const loading = ref(false)
const result = ref<AnalyzeResult | null>(null)
const activeTab = ref(0)

async function runAnalyze() {
  if (!query.value.trim()) {
    ElMessage.warning('请输入公司名称或股票代码')
    return
  }
  loading.value = true
  result.value = null
  try {
    const data = await analyzeCompany(query.value)
    if (!data) {
      ElMessage.error('未找到该公司，请先在数据页录入或尝试示例：金蝶国际 / 0268.HK')
      return
    }
    if (data.constraints.length === 0) {
      ElMessage.warning('未匹配到公理库规则，请检查公司行业配置')
      return
    }
    result.value = data
    activeTab.value = 0
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section>
    <p class="intro">
      输入 A 股 / 港股公司名称或代码，推导关键限制因素并预测其解决前景。
    </p>

    <div class="search card-surface">
      <el-input
        v-model="query"
        size="large"
        placeholder="例如：金蝶国际 或 0268.HK"
        clearable
        @keyup.enter="runAnalyze"
      />
      <el-button type="primary" size="large" :loading="loading" @click="runAnalyze">
        推演
      </el-button>
    </div>

    <div v-if="result" class="results">
      <div class="company-header">
        <h2>{{ result.company.name }}</h2>
        <span class="code">{{ result.company.code }} · {{ result.company.market }}</span>
      </div>

      <el-tabs
        v-if="result.constraints.length > 1"
        v-model="activeTab"
        class="constraint-tabs"
      >
        <el-tab-pane
          v-for="(item, index) in result.constraints"
          :key="item.rule.id"
          :label="item.rule.constraintName"
          :name="index"
        >
          <ConstraintCard :result="item" :company-name="result.company.name" />
        </el-tab-pane>
      </el-tabs>

      <ConstraintCard
        v-else-if="result.constraints[0]"
        :result="result.constraints[0]"
        :company-name="result.company.name"
      />
    </div>

    <el-empty v-else-if="!loading" class="placeholder" description="输入公司后开始推演" />
  </section>
</template>

<style scoped>
.intro {
  color: var(--tesseract-muted);
  margin: 0 0 20px;
  line-height: 1.6;
}
.search {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}
.search .el-input {
  flex: 1;
}
.results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.company-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.company-header h2 {
  margin: 0;
  font-size: 20px;
}
.code {
  color: var(--tesseract-muted);
  font-size: 14px;
}
.placeholder {
  margin-top: 48px;
}
</style>
