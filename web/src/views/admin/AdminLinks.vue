<template>
  <div>
    <div class="page-header">
      <h2>友情链接</h2>
      <button @click="showAdd = true" class="btn btn-primary">+ 添加友链</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="links-grid">
      <div v-for="link in links" :key="link.id" class="link-card">
        <div class="link-card__content">
          <h3>{{ link.name }}</h3>
          <a :href="link.url" target="_blank" class="link-url">{{ link.url }}</a>
          <p v-if="link.description" class="link-desc">{{ link.description }}</p>
        </div>
        <div class="link-card__actions">
          <button @click="editLink(link)" class="btn btn-sm">编辑</button>
          <button @click="deleteLink(link.id)" class="btn btn-sm btn-danger">删除</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showAdd || editing" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editing ? '编辑友链' : '添加友链' }}</h3>
        <form @submit.prevent="saveLink">
          <div class="form-group">
            <label>站点名称 *</label>
            <input v-model="form.name" type="text" required class="form-input" />
          </div>
          <div class="form-group">
            <label>链接地址 *</label>
            <input v-model="form.url" type="url" required class="form-input" placeholder="https://example.com" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <input v-model="form.description" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Logo URL</label>
            <input v-model="form.logo" type="url" class="form-input" />
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
const links = ref([])
const loading = ref(false)
const error = ref(null)
const showAdd = ref(false)
const editing = ref(null)
const saving = ref(false)

const form = ref({
  name: '',
  url: '',
  description: '',
  logo: '',
  sort_order: 0
})

async function loadLinks() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/admin/links', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.data.success) {
      links.value = res.data.data
    }
  } catch (e) {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

function editLink(link) {
  editing.value = link.id
  form.value = { ...link }
  showAdd.value = true
}

function closeModal() {
  showAdd.value = false
  editing.value = null
  form.value = { name: '', url: '', description: '', logo: '', sort_order: 0 }
}

async function saveLink() {
  saving.value = true
  try {
    if (editing.value) {
      await axios.put(`/api/v1/admin/links/${editing.value}`, form.value, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    } else {
      await axios.post('/api/v1/admin/links', form.value, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    }
    closeModal()
    loadLinks()
  } catch (e) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteLink(id) {
  if (!confirm('确定要删除这个友链吗？')) return
  try {
    await axios.delete(`/api/v1/admin/links/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    loadLinks()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(loadLinks)
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

.links-grid {
  display: grid;
  gap: 16px;
}

.link-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-card__content h3 {
  margin-bottom: 4px;
}

.link-url {
  color: var(--primary-color);
  font-size: 0.875rem;
}

.link-desc {
  opacity: 0.7;
  font-size: 0.875rem;
  margin-top: 4px;
}

.link-card__actions {
  display: flex;
  gap: 8px;
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