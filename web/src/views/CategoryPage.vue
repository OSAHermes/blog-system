<template>
  <div class="category-page">
    <div class="container">
      <h1 class="page-title">{{ categoryName || '分类文章' }}</h1>
      
      <div v-if="loading" class="page-loading">加载中...</div>
      <div v-else-if="error" class="page-error">{{ error }}</div>
      <div v-else-if="articles.length === 0" class="page-empty">暂无文章</div>
      <div v-else class="articles-list">
        <article v-for="article in articles" :key="article.id" class="article-card">
          <router-link :to="`/article/${article.slug}`" class="article-card__title">
            {{ article.title }}
          </router-link>
          <p class="article-card__summary">{{ article.summary || article.content.substring(0, 100) + '...' }}</p>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const categoryId = computed(() => route.params.id)

const articles = ref([])
const category = ref(null)
const loading = ref(true)
const error = ref(null)

const categoryName = computed(() => category.value?.name || '分类文章')

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [articlesRes, categoriesRes] = await Promise.all([
      axios.get(`/api/v1/public/categories/${categoryId.value}/articles`),
      axios.get('/api/v1/public/categories')
    ])

    if (articlesRes.data.success) {
      articles.value = articlesRes.data.data
    }
    if (categoriesRes.data.success) {
      category.value = categoriesRes.data.data.find(c => c.id == categoryId.value)
    }
  } catch (e) {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(loadData)
</script>

<style scoped>
.category-page {
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

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
}

.article-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
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

.article-card__meta {
  font-size: 0.875rem;
  opacity: 0.6;
  display: flex;
  gap: 16px;
}
</style>