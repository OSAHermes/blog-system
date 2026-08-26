<template>
  <div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon">📝</div>
        <div class="stat-card__value">{{ stats.articles }}</div>
        <div class="stat-card__label">文章总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📁</div>
        <div class="stat-card__value">{{ stats.categories }}</div>
        <div class="stat-card__label">分类数量</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">🏷️</div>
        <div class="stat-card__value">{{ stats.tags }}</div>
        <div class="stat-card__label">标签数量</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">👁</div>
        <div class="stat-card__value">{{ stats.totalViews }}</div>
        <div class="stat-card__label">总浏览量</div>
      </div>
    </div>

    <div class="settings-section">
      <h2>站点设置</h2>
      <form @submit.prevent="saveSettings" class="settings-form">
        <div class="form-group">
          <label>站点名称</label>
          <input v-model="settings.site_name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>站点副标题</label>
          <input v-model="settings.site_subtitle" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>站点描述</label>
          <textarea v-model="settings.site_description" class="form-textarea" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>页脚文字</label>
          <input v-model="settings.footer_text" type="text" class="form-input" />
        </div>
        <button type="submit" class="btn btn-primary">保存设置</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const stats = ref({ articles: 0, categories: 0, tags: 0, totalViews: 0 })
const settings = ref({
  site_name: '',
  site_subtitle: '',
  site_description: '',
  footer_text: ''
})
const saving = ref(false)

async function loadStats() {
  try {
    const res = await axios.get('/api/v1/admin/statistics', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.data.success) {
      stats.value = res.data.data
    }
  } catch (e) {
    console.error('Failed to load stats', e)
  }
}

async function loadSettings() {
  try {
    const res = await axios.get('/api/v1/admin/settings', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.data.success) {
      settings.value = res.data.data
    }
  } catch (e) {
    console.error('Failed to load settings', e)
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await axios.put('/api/v1/admin/settings', settings.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    alert('设置已保存')
  } catch (e) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadStats()
  loadSettings()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.stat-card__icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.stat-card__value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-card__label {
  opacity: 0.7;
  margin-top: 4px;
}

.settings-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.settings-section h2 {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
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
.form-textarea {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
}

.form-textarea {
  resize: vertical;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
  align-self: flex-start;
}

.btn:hover {
  opacity: 0.9;
}
</style>