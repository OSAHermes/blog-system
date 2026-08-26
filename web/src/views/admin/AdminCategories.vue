<template>
  <div>
    <div class="page-header">
      <h2>分类管理</h2>
      <button @click="showAdd = true" class="btn btn-primary">+ 新建分类</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>slug</th>
            <th>文章数</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>{{ cat.name }}</td>
            <td>{{ cat.slug }}</td>
            <td>{{ cat.article_count || 0 }}</td>
            <td>{{ cat.sort_order }}</td>
            <td>
              <button @click="editCategory(cat)" class="btn btn-sm">编辑</button>
              <button @click="deleteCategory(cat.id)" class="btn btn-sm btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAdd || editing" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editing ? '编辑分类' : '新建分类' }}</h3>
        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <label>名称 *</label>
            <input v-model="form.name" type="text" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input v-model="form.slug" type="text" class="form-input" placeholder="自动生成" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description" class="form-textarea" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="form.sort_order" type="number" class="form-input" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">保存</button>
            <button type="button" @click="closeModal" class="btn">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const showAdd = ref(false)
const editing = ref(null)
const saving = ref(false)

const form = ref({
  name: '',
  slug: '',
  description: '',
  sort_order: 0
})

async function loadCategories() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/admin/categories', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.data.success) {
      categories.value = res.data.data
    }
  } catch (e) {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

function editCategory(cat) {
  editing.value = cat.id
  form.value = { ...cat }
  showAdd.value = true
}

function closeModal() {
  showAdd.value = false
  editing.value = null
  form.value = { name: '', slug: '', description: '', sort_order: 0 }
}

async function saveCategory() {
  saving.value = true
  try {
    if (editing.value) {
      await axios.put(`/api/v1/admin/categories/${editing.value}`, form.value, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    } else {
      await axios.post('/api/v1/admin/categories', form.value, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    }
    closeModal()
    loadCategories()
  } catch (e) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteCategory(id) {
  if (!confirm('确定要删除这个分类吗？')) return
  try {
    await axios.delete(`/api/v1/admin/categories/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    loadCategories()
  } catch (e) {
    alert(e.response?.data?.error || '删除失败')
  }
}

onMounted(loadCategories)
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
}

.modal h3 {
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-input,
.form-textarea {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
  margin-right: 8px;
}

.btn-danger {
  background: #f44336;
  color: #fff;
}
</style>