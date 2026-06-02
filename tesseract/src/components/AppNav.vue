<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const links = [
  { path: '/', label: '观察名单', match: (p: string) => p === '/' || p.startsWith('/company') },
  { path: '/sources', label: '信源库', match: (p: string) => p === '/sources' },
  { path: '/settings', label: 'AI 设置', match: (p: string) => p === '/settings' },
]
</script>

<template>
  <header class="nav">
    <div class="brand" @click="router.push('/')">
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
        :class="{ active: link.match(route.path) }"
        @click="router.push(link.path)"
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
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
}
.links {
  display: flex;
  gap: 8px;
}
.link {
  background: transparent;
  border: 1px solid var(--tesseract-border);
  color: var(--tesseract-muted);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.link:hover,
.link.active {
  color: var(--tesseract-text);
  border-color: var(--tesseract-accent);
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
}
</style>
