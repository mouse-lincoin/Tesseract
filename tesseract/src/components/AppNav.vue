<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
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
  </header>
</template>

<style scoped>
.nav {
  margin-bottom: 32px;
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
