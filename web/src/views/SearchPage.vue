<template>
  <div class="search-page">
    <div class="container">
      <h1 class="page-title">搜索结果</h1>
      
      <div class="search-box">
        <input
          v-model="keyword"
          type="text"
          placeholder="输入关键词搜索..."
          class="search-input"
          @keyup.enter="doSearch"
        >
        <button @click="doSearch" class="search-btn">搜索</button>
      </div>

      <div v-if="loading" class="page-loading">搜索中...</div>
      <div v-else-if="error" class="page-error">{{ error }}</div>
      <div v-else-if="!keyword" class="page-empty">请输入搜索关键词</div>
      <div v-else-if="results.length === 0" class="page-empty">未找到相关文章</div>
      <div v-else class="results-info">
        <p>找到 {{ results.length }} 篇相关文章</p>
      </div>

      <div v-if="results.length > 0" class="articles-list">
        <article v-for="article in results" :key="article.id" class="article-card">
          <router-link :to="`/article/${article.slug}`" class="article-card__title">
            {{ article.title }}
          </router-link>
          <p class="article-card__summary">{{ article.summary || highlight(extractText(article.content), keyword) }}</p>
          <div class="article-card__meta">
            <span>{{ formatDate(article.created_at) }}</span>
            <span>👁 {{ article.view_count }}</span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.q || '')
const results = ref([])
const loading = ref(false)
const error = ref(null)

async function doSearch() {
  if (!keyword.value.trim()) return
  
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/v1/public/search', { params: { q: keyword.value } })
    if (res.data.success) {
      results.value = res.data.data
    }
  } catch (e) {
    error.value = '搜索失败'
  } finally {
    loading.value = false
  }
}

function extractText(content) {
  return content.replace(/<[^>]*>/g, '').replace(/\n+/g, ' ').substring(0, 200)
}

function highlight(text, keyword) {
  if (!keyword) return text
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => {
  if (keyword.value) {
    doSearch()
  }
})
</script>

<style scoped>
.search-page {
  min-height: calc(100vh - 60px - 120px);
  padding: 40px 0;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);
}

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 1rem;
}

.search-btn {
  padding: 12px 24px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.search-btn:hover {
  opacity: 0.9;
}

.page-loading,
.page-error,
.page-empty {
  text-align: center;
  padding: 60px 0;
  opacity: 0.6;
}

.results-info {
  margin-bottom: 24px;
  opacity: 0.7;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.article-card__title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
}

.article-card__title:hover {
  color: var(--primary-color);
}

.article-card__summary {
  opacity: 0.8;
  margin-bottom: 12px;
}

.article-card__summary :deep(mark) {
  background: #ffeb3b;
  padding: 2px 4px;
  border-radius: 2px;
}

.article-card__meta {
  font-size: 0.875rem;
  opacity: 0.6;
  display: flex;
  gap: 16px;
}
</style>