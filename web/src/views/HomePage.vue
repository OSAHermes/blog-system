<template>
  <div class="home">
    <div class="container">
      <div class="home__layout">
        <!-- Main Content -->
        <main class="home__main">
          <div v-if="loading" class="home__loading">加载中...</div>
          <div v-else-if="error" class="home__error">{{ error }}</div>
          <div v-else-if="articles.length === 0" class="home__empty">暂无文章</div>
          <div v-else class="home__articles">
            <article v-for="article in articles" :key="article.id" class="article-card">
              <div class="article-card__header">
                <router-link :to="`/article/${article.slug}`" class="article-card__title">
                  {{ article.title }}
                </router-link>
                <span v-if="article.category_name" class="article-card__category">
                  {{ article.category_name }}
                </span>
              </div>
              <p class="article-card__summary">{{ article.summary || extractSummary(article.content) }}</p>
              <div class="article-card__meta">
                <span class="article-card__date">{{ formatDate(article.created_at) }}</span>
                <span class="article-card__views">👁 {{ article.view_count }}</span>
                <span v-if="article.tags" class="article-card__tags">
                  <span v-for="tag in article.tags.split(',')" :key="tag" class="article-card__tag">
                    #{{ tag.trim() }}
                  </span>
                </span>
              </div>
            </article>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="home__pagination">
              <button :disabled="pagination.page <= 1" @click="loadArticles(pagination.page - 1)">上一页</button>
              <span>第 {{ pagination.page }} / {{ pagination.totalPages }} 页</span>
              <button :disabled="pagination.page >= pagination.totalPages" @click="loadArticles(pagination.page + 1)">下一页</button>
            </div>
          </div>
        </main>

        <!-- Sidebar -->
        <aside class="home__sidebar">
          <div class="sidebar__widget">
            <h3 class="sidebar__title">关于本站</h3>
            <p class="sidebar__text">{{ settings.site_description || '记录技术，分享生活' }}</p>
          </div>

          <div class="sidebar__widget">
            <h3 class="sidebar__title">分类</h3>
            <ul class="sidebar__list">
              <li v-for="cat in categories" :key="cat.id">
                <router-link :to="`/categories/${cat.id}`" class="sidebar__link">
                  {{ cat.name }}
                  <span class="sidebar__count">{{ cat.article_count }}</span>
                </router-link>
              </li>
            </ul>
          </div>

          <div class="sidebar__widget">
            <h3 class="sidebar__title">标签云</h3>
            <div class="sidebar__tags">
              <router-link
                v-for="tag in tags.slice(0, 20)"
                :key="tag.id"
                :to="`/tags/${tag.slug}`"
                class="sidebar__tag"
                :style="{ fontSize: `${Math.max(0.8, Math.min(1.2, tag.article_count / 10))}rem` }"
              >
                {{ tag.name }}
              </router-link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const articles = ref([])
const categories = ref([])
const tags = ref([])
const settings = ref({})
const loading = ref(false)
const error = ref(null)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })

async function loadArticles(page = 1) {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/v1/public/articles', { params: { page, limit: 10 } })
    if (res.data.success) {
      articles.value = res.data.data
      pagination.value = res.data.pagination
    }
  } catch (e) {
    error.value = '加载文章失败'
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await axios.get('/api/v1/public/categories')
    if (res.data.success) {
      categories.value = res.data.data
    }
  } catch (e) {
    console.error('Failed to load categories', e)
  }
}

async function loadTags() {
  try {
    const res = await axios.get('/api/v1/public/tags')
    if (res.data.success) {
      tags.value = res.data.data
    }
  } catch (e) {
    console.error('Failed to load tags', e)
  }
}

async function loadSettings() {
  try {
    const res = await axios.get('/api/v1/public/settings')
    if (res.data.success) {
      settings.value = res.data.data
    }
  } catch (e) {
    console.error('Failed to load settings', e)
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function extractSummary(content) {
  const text = content.replace(/<[^>]*>/g, '').replace(/\n+/g, ' ')
  return text.substring(0, 150) + (text.length > 150 ? '...' : '')
}

onMounted(() => {
  loadArticles()
  loadCategories()
  loadTags()
  loadSettings()
})
</script>

<style scoped>
.home {
  min-height: calc(100vh - 60px - 120px);
  padding: 40px 0;
}

.home__layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
}

.home__main {
  min-width: 0;
}

.home__articles {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.article-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.article-card__title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
}

.article-card__title:hover {
  color: var(--primary-color);
}

.article-card__category {
  background: var(--primary-color);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
}

.article-card__summary {
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 16px;
  line-height: 1.6;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.6;
}

.article-card__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.article-card__tag {
  background: var(--border-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.home__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
}

.home__pagination button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.home__pagination button:hover:not(:disabled) {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.home__pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.home__loading,
.home__error,
.home__empty {
  text-align: center;
  padding: 60px 0;
  color: var(--text-color);
  opacity: 0.6;
}

/* Sidebar */
.home__sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar__widget {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.sidebar__title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color);
}

.sidebar__text {
  font-size: 0.875rem;
  opacity: 0.8;
  line-height: 1.6;
}

.sidebar__list {
  list-style: none;
}

.sidebar__link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: var(--text-color);
  text-decoration: none;
  border-bottom: 1px solid var(--border-color);
  transition: color 0.2s;
}

.sidebar__link:hover {
  color: var(--primary-color);
}

.sidebar__link:last-child {
  border-bottom: none;
}

.sidebar__count {
  background: var(--border-color);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sidebar__tag {
  color: var(--text-color);
  text-decoration: none;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  transition: all 0.2s;
}

.sidebar__tag:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

@media (max-width: 900px) {
  .home__layout {
    grid-template-columns: 1fr;
  }

  .home__sidebar {
    order: -1;
  }
}
</style>