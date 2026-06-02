<script setup lang="ts">
import { onMounted } from 'vue'
import AppNav from './components/AppNav.vue'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.bootstrap()
})
</script>

<template>
  <div v-if="appStore.error" class="tesseract-layout">
    <el-alert :title="appStore.error" type="error" show-icon />
  </div>
  <div v-else-if="!appStore.ready" class="tesseract-layout loading">
    <el-icon class="spin"><Loading /></el-icon>
    <span>正在初始化本地数据库…</span>
  </div>
  <div v-else class="tesseract-layout">
    <AppNav />
    <router-view />
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  color: var(--tesseract-muted);
}
.spin {
  animation: spin 1s linear infinite;
  font-size: 24px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
