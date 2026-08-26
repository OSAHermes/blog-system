<template>
  <div>
    <div class="page-header">
      <h2>文章管理</h2>
      <router-link to="/admin/articles/new" class="btn btn-primary">+ 新建文章</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>浏览</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.title }}</td>
            <td>{{ article.category_name || '-' }}</td>
            <td>
              <span :class="['status', article.status === 1 ? 'status--published' : 'status--draft']">
                {{ article.status === 1 ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ article.view_count }}</td>
            <td>{{ formatDate(article.created_at) }}</td>
            <td>
              <router-link :to="`/admin/articles/edit/${article.id}`" class="btn btn-sm">编辑</router-link>
              <button @click="deleteArticle(article.id)" class="btn btn-sm btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagination.totalPages > 1" class="pagination">
        <button :disabled="pagination.page <= 1" @click="loadArticles(pagination.page - 1)">上一页</button>
        <span>第 {{ pagination.page }} / {{ pagination.totalPages }} 页</span>
        <button :disabled="pagination.page >= pagination.totalPages" @click="loadArticles(pagination.page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const articles = ref([])
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
const loading = ref(false)
const error = ref(null)

async function loadArticles(page = 1) {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/v1/admin/articles', {
      params: { page, limit: 20 },
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.data.success) {
      articles.value = res.data.data
      pagination.value = res.data.pagination
    }
  } catch (e) {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

async function deleteArticle(id) {
  if (!confirm('确定要删除这篇文章吗？')) return
  try {
    await axios.delete(`/api/v1/admin/articles/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    loadArticles(pagination.value.page)
  } catch (e) {
    alert('删除失败')
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => loadArticles())
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  opacity: 0.7;
}

.table-container {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background: var(--footer-bg);
  font-weight: 600;
}

.data-table tr:hover {
  background: var(--footer-bg);
}

.status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.875rem;
}

.status--published {
  background: #4caf50;
  color: #fff;
}

.status--draft {
  background: #ff9800;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.875rem;
  margin-right: 8px;
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-danger {
  background: #f44336;
  color: #fff;
}
</style>