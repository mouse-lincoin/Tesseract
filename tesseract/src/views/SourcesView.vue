<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addTrustedSource, listTrustedSources, removeTrustedSource } from '../services/trustedSources'

const router = useRouter()
const sources = ref<Awaited<ReturnType<typeof listTrustedSources>>>([])

const form = ref({
  url: '',
  label: '',
  tags: '',
  note: '',
})

async function load() {
  sources.value = await listTrustedSources()
}

async function add() {
  if (!form.value.url.trim()) {
    ElMessage.warning('请填写 URL 或域名')
    return
  }
  await addTrustedSource({
    url: form.value.url,
    label: form.value.label || form.value.url,
    tags: form.value.tags
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean),
    note: form.value.note,
  })
  form.value = { url: '', label: '', tags: '', note: '' }
  ElMessage.success('已加入信源库')
  await load()
}

async function remove(id: string) {
  await removeTrustedSource(id)
  await load()
}

onMounted(load)
</script>

<template>
  <section>
    <button type="button" class="back" @click="router.push('/')">← 观察名单</button>
    <h2>优质信源库</h2>
    <p class="intro">记录你认为可靠的网址/域名，后续调研收集时优先复用。</p>

    <div class="card-surface add">
      <el-form label-position="top">
        <el-form-item label="URL 或首页">
          <el-input v-model="form.url" placeholder="https://…" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.label" placeholder="如：港交所披露易" />
        </el-form-item>
        <el-form-item label="标签（逗号分隔）">
          <el-input v-model="form.tags" placeholder="年报, 监管" />
        </el-form-item>
        <el-form-item label="为何优质">
          <el-input v-model="form.note" type="textarea" :rows="2" />
        </el-form-item>
        <el-button type="primary" @click="add">加入信源库</el-button>
      </el-form>
    </div>

    <el-empty v-if="!sources.length" description="暂无信源" />
    <ul v-else class="list">
      <li v-for="s in sources" :key="s.id" class="item card-surface">
        <strong>{{ s.label }}</strong>
        <span class="pattern">{{ s.pattern }}</span>
        <p v-if="s.note" class="note">{{ s.note }}</p>
        <div v-if="s.tags.length" class="tags">
          <el-tag v-for="t in s.tags" :key="t" size="small">{{ t }}</el-tag>
        </div>
        <el-button type="danger" link @click="remove(s.id)">删除</el-button>
      </li>
    </ul>
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
  margin: 0 0 20px;
  line-height: 1.6;
}
.add {
  margin-bottom: 20px;
  padding: 18px 20px;
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
  padding: 14px 16px;
}
.pattern {
  display: block;
  color: var(--tesseract-muted);
  font-size: 13px;
  margin: 4px 0;
}
.note {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
</style>
