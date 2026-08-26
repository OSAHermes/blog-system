<template>
  <div class="tags-page">
    <div class="container">
      <h1 class="page-title">{{ tagName || '标签' }}</h1>
      
      <div v-if="loading" class="page-loading">加载中...</div>
      <div v-else-if="error" class="page-error">{{ error }}</div>
      <div v-else-if="!tagName" class="tags-cloud">
        <router-link
          v-for="tag in tags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="tag-item"
          :style="{ fontSize: `${Math.max(0.9, Math.min(1.5, tag.article_count / 5))}rem` }"
        >
          {{ tag.name }}
          <span class="tag-count">{{ tag.article_count }}</span>
        </router-link>
      </div>
      <div v-else class="articles-list">
        <article v-for="article in articles" :key="article.id" class="article-card">
          <router-link :to="`/article/${article.slug}`" class="article-card__title">
            {{ article.title }}
          </router-link>
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
const slug = computed(() => route.params.slug)

const tags = ref([])
const articles = ref([])
const tagName = ref(null)
const loading = ref(true)
const error = ref(null)

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [tagsRes] = await Promise.all([
      axios.get('/api/v1/public/tags')
    ])

    if (slug.value) {
      const articlesRes = await axios.get(`/api/v1/public/tags/${slug.value}/articles`)
      if (articlesRes.data.success) {
        articles.value = articlesRes.data.data
      }
      // Find tag name
      const tag = tagsRes.data.data.find(t => t.slug === slug.value)
      tagName.value = tag?.name || slug.value
    }

    tags.value = tagsRes.data.data
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
.tags-page {
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
.page-error {
  text-align: center;
  padding: 60px 0;
  opacity: 0.6;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 800px;
}

.tag-item {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.2s;
}

.tag-item:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.tag-count {
  font-size: 0.75em;
  opacity: 0.7;
  margin-left: 4px;
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

.article-card__meta {
  font-size: 0.875rem;
  opacity: 0.6;
  display: flex;
  gap: 16px;
}
</style>