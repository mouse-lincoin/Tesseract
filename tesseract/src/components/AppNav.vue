<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const links = [
  { path: '/', label: '分析' },
  { path: '/rules', label: '规则' },
  { path: '/data', label: '数据' },
]

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <header class="nav">
    <div class="brand" @click="go('/')">
      <span class="logo">◇</span>
      <div>
        <h1>Tesseract</h1>
        <p class="tesseract-tagline">Noise is the enemy of truth.</p>
      </div>
    </div>
    <nav class="links">
      <button
        v-for="link in links"
        :key="link.path"
        type="button"
        class="link"
        :class="{ active: route.path === link.path }"
        @click="go(link.path)"
      >
        {{ link.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
}
.brand {
  display: flex;
  gap: 12px;
  cursor: pointer;
  align-items: center;
}
.logo {
  font-size: 28px;
  color: var(--tesseract-accent);
}
h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.links {
  display: flex;
  gap: 8px;
}
.link {
  background: transparent;
  border: 1px solid var(--tesseract-border);
  color: var(--tesseract-muted);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
}
.link:hover,
.link.active {
  color: var(--tesseract-text);
  border-color: var(--tesseract-accent);
  background: rgba(88, 166, 255, 0.08);
}
</style>
