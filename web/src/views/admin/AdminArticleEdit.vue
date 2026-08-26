<template>
  <div>
    <h2>{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
    
    <form @submit.prevent="saveArticle" class="article-form">
      <div class="form-group">
        <label>标题 *</label>
        <input v-model="form.title" type="text" required class="form-input" />
      </div>

      <div class="form-group">
        <label>URL 别名 (Slug)</label>
        <input v-model="form.slug" type="text" class="form-input" placeholder="如: my-first-post" />
      </div>

      <div class="form-group">
        <label>摘要</label>
        <textarea v-model="form.summary" class="form-textarea" rows="2" placeholder="文章简要描述..."></textarea>
      </div>

      <div class="form-group">
        <label>分类</label>
        <select v-model="form.category_id" class="form-select">
          <option value="">无分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>标签 (逗号分隔)</label>
        <input v-model="tagsInput" type="text" class="form-input" placeholder="Vue, JavaScript, 教程" />
      </div>

      <div class="form-group">
        <label>内容 *</label>
        <textarea v-model="form.content" class="form-textarea" rows="15" required placeholder="使用 Markdown 格式编写文章内容..."></textarea>
      </div>

      <div class="form-group">
        <label>状态</label>
        <select v-model="form.status" class="form-select">
          <option :value="1">发布</option>
          <option :value="0">草稿</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <router-link to="/admin/articles" class="btn">取消</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)

const form = ref({
  title: '',
  slug: '',
  summary: '',
  content: '',
  category_id: null,
  status: 1
})

const tagsInput = ref('')
const categories = ref([])

async function loadArticle() {
  if (!isEdit.value) return
  try {
    const res = await axios.get('/api/v1/admin/articles', {
      params: { page: 1, limit: 100 },
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    const article = res.data.data.find(a => a.id == route.params.id)
    if (article) {
      form.value = { ...article }
      tagsInput.value = article.tags || ''
    }
  } catch (e) {
    console.error('Failed to load article', e)
  }
}

async function loadCategories() {
  try {
    const res = await axios.get('/api/v1/admin/categories', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.data.success) {
      categories.value = res.data.data
    }
  } catch (e) {
    console.error('Failed to load categories', e)
  }
}

async function saveArticle() {
  saving.value = true
  try {
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    const data = { ...form.value, tags }
    
    if (isEdit.value) {
      await axios.put(`/api/v1/admin/articles/${route.params.id}`, data, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    } else {
      await axios.post('/api/v1/admin/articles', data, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    }
    
    router.push('/admin/articles')
  } catch (e) {
    alert('保存失败: ' + (e.response?.data?.error || e.message))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadArticle()
  loadCategories()
})
</script>

<style scoped>
h2 {
  margin-bottom: 24px;
}

.article-form {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  background: var(--border-color);
  color: var(--text-color);
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>