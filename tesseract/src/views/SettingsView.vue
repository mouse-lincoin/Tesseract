<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DEFAULT_DEEPSEEK_SETTINGS,
  getAiSettings,
  saveAiSettings,
  type AiSettings,
} from '../services/aiSettings'

const router = useRouter()
const form = ref<AiSettings>({ ...DEFAULT_DEEPSEEK_SETTINGS })

onMounted(async () => {
  form.value = await getAiSettings()
})

async function save() {
  await saveAiSettings({ ...form.value })
  ElMessage.success('DeepSeek 配置已保存（仅存本机）')
}
</script>

<template>
  <section>
    <button type="button" class="back" @click="router.push('/')">← 观察名单</button>
    <h2>AI 设置</h2>
    <p class="intro">
      默认使用 <strong>DeepSeek</strong>。密钥仅保存在浏览器 IndexedDB，不会上传至 GitHub。
      全自动调研会向 DeepSeek 发送公司名、阶段、已有证据摘要等上下文。
    </p>

    <div class="card-surface panel">
      <el-form label-position="top">
        <el-form-item label="API Base URL">
          <el-input v-model="form.apiBaseUrl" placeholder="https://api.deepseek.com" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="form.apiKey" type="password" show-password placeholder="sk-..." />
        </el-form-item>
        <el-form-item label="模型">
          <el-input v-model="form.model" placeholder="deepseek-chat" />
        </el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form>
      <p class="warn">
        若浏览器报 CORS 错误，需使用支持浏览器调用的代理，或等待 Phase 3 后端代理。
      </p>
    </div>
  </section>
</template>

<style scoped>
.back {
  background: none;
  border: none;
  color: var(--tesseract-muted);
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
}
h2 {
  margin: 0 0 8px;
}
.intro {
  color: var(--tesseract-muted);
  line-height: 1.7;
  margin: 0 0 20px;
}
.panel {
  padding: 20px;
  max-width: 480px;
}
.warn {
  margin: 16px 0 0;
  font-size: 13px;
  color: var(--tesseract-warning);
  line-height: 1.5;
}
</style>
