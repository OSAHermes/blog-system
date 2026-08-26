<template>
  <div class="links-page">
    <div class="container">
      <h1 class="page-title">友情链接</h1>
      
      <div v-if="loading" class="page-loading">加载中...</div>
      <div v-else-if="error" class="page-error">{{ error }}</div>
      <div v-else-if="links.length === 0" class="page-empty">暂无友链</div>
      <div v-else class="links-grid">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card"
        >
          <div class="link-card__logo" v-if="link.logo">
            <img :src="link.logo" :alt="link.name" />
          </div>
          <div class="link-card__info">
            <h3 class="link-card__name">{{ link.name }}</h3>
            <p class="link-card__desc">{{ link.description }}</p>
          </div>
        </a>
      </div>

      <div class="links-apply">
        <h2>申请友链</h2>
        <p>如果您也想交换友链，请联系我！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const links = ref([])
const loading = ref(true)
const error = ref(null)

async function loadLinks() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/v1/public/links')
    if (res.data.success) {
      links.value = res.data.data
    }
  } catch (e) {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadLinks)
</script>

<style scoped>
.links-page {
  min-height: calc(100vh - 60px - 120px);
  padding: 40px 0;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);
}

.page-loading,
.page-error,
.page-empty {
  text-align: center;
  padding: 60px 0;
  opacity: 0.6;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.link-card__logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.link-card__logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-card__info {
  flex: 1;
  min-width: 0;
}

.link-card__name {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-card__desc {
  font-size: 0.875rem;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.links-apply {
  text-align: center;
  padding: 40px;
  background: var(--card-bg);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
}

.links-apply h2 {
  margin-bottom: 8px;
}

.links-apply p {
  opacity: 0.7;
}
</style>