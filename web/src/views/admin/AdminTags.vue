<template>
  <div>
    <div class="page-header">
      <h2>标签管理</h2>
      <button @click="showAdd = true" class="btn btn-primary">+ 新建标签</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="tags-list">
      <div v-for="tag in tags" :key="tag.id" class="tag-item">
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tag-slug">/{{ tag.slug }}</span>
        <div class="tag-actions">
          <button @click="editTag(tag)" class="btn btn-sm">编辑</button>
          <button @click="deleteTag(tag.id)" class="btn btn-sm btn-danger">删除</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showAdd || editing" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editing ? '编辑标签' : '新建标签' }}</h3>
        <form @submit.prevent="saveTag">
          <div class="form-group">
            <label>名称 *</label>
            <input v-model="form.name" type="text" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input v-model="form.slug" type="text" class="form-input" />
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
const tags = ref([])
const loading = ref(false)
const error = ref(null)
const showAdd = ref(false)
const editing = ref(null)
const saving = ref(false)

const form = ref({ name: '', slug: '' })

async function loadTags() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/admin/tags', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.data.success) {
      tags.value = res.data.data
    }
  } catch (e) {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

function editTag(tag) {
  editing.value = tag.id
  form.value = { ...tag }
  showAdd.value = true
}

function closeModal() {
  showAdd.value = false
  editing.value = null
  form.value = { name: '', slug: '' }
}

async function saveTag() {
  saving.value = true
  try {
    if (editing.value) {
      await axios.put(`/api/v1/admin/tags/${editing.value}`, form.value, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    } else {
      await axios.post('/api/v1/admin/tags', form.value, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    }
    closeModal()
    loadTags()
  } catch (e) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteTag(id) {
  if (!confirm('确定要删除这个标签吗？')) return
  try {
    await axios.delete(`/api/v1/admin/tags/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    loadTags()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(loadTags)
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

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
}

.tag-name {
  font-weight: 500;
}

.tag-slug {
  opacity: 0.6;
  font-size: 0.875rem;
}

.tag-actions {
  display: flex;
  gap: 4px;
  margin-left: 8px;
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
  max-width: 400px;
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

.form-input {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
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
}

.btn-danger {
  background: #f44336;
  color: #fff;
}
</style>