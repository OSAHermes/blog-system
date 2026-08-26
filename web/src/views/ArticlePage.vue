<template>
  <div class="article-page">
    <div class="container">
      <div v-if="loading" class="article-page__loading">加载中...</div>
      <div v-else-if="error" class="article-page__error">{{ error }}</div>
      <div v-else-if="article" class="article-page__content">
        <article class="article">
          <header class="article__header">
            <h1 class="article__title">{{ article.title }}</h1>
            <div class="article__meta">
              <span class="article__date">{{ formatDate(article.created_at) }}</span>
              <span class="article__category">{{ article.category_name }}</span>
              <span class="article__views">👁 {{ article.view_count }} 阅读</span>
            </div>
          </header>

          <div class="article__body" v-html="renderedContent"></div>

          <footer class="article__footer">
            <div class="article__tags" v-if="article.tags">
              <router-link
                v-for="tag in article.tags.split(',')"
                :key="tag"
                :to="`/tags/${tag.trim().toLowerCase().replace(/\s+/g, '-')}`"
                class="article__tag"
              >
                #{{ tag.trim() }}
              </router-link>
            </div>
            <div class="article__actions">
              <router-link to="/" class="article__back">← 返回首页</router-link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const md = new MarkdownIt()

const article = ref(null)
const loading = ref(true)
const error = ref(null)

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return md.render(article.value.content)
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function loadArticle() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`/api/v1/public/articles/${route.params.slug}`)
    if (res.data.success) {
      article.value = res.data.data
    }
  } catch (e) {
    error.value = e.response?.data?.error || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadArticle)
</script>

<style scoped>
.article-page {
  min-height: calc(100vh - 60px - 120px);
  padding: 40px 0;
}

.article-page__loading,
.article-page__error {
  text-align: center;
  padding: 60px 0;
  color: var(--text-color);
  opacity: 0.6;
}

.article {
  max-width: 800px;
  margin: 0 auto;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 40px;
}

.article__header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border-color);
}

.article__title {
  font-size: 2rem;
  margin-bottom: 16px;
  line-height: 1.3;
}

.article__meta {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.6;
}

.article__body {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 32px;
}

.article__body :deep(h1),
.article__body :deep(h2),
.article__body :deep(h3) {
  margin: 24px 0 16px;
}

.article__body :deep(p) {
  margin-bottom: 16px;
}

.article__body :deep(code) {
  background: var(--border-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.article__body :deep(pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.article__body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.article__footer {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.article__tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.article__tag {
  background: var(--border-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-color);
  text-decoration: none;
}

.article__tag:hover {
  background: var(--primary-color);
  color: #fff;
}

.article__back {
  color: var(--text-color);
  text-decoration: none;
  opacity: 0.7;
}

.article__back:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .article {
    padding: 24px;
  }

  .article__title {
    font-size: 1.5rem;
  }
}
</style>