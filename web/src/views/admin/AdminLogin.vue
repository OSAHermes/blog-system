<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>管理后台</h1>
        <p>个人博客系统</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" required class="form-input" placeholder="请输入用户名" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" required class="form-input" placeholder="请输入密码" />
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <p class="login-hint">默认账号: admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.post('/api/v1/admin/login', {
      username: username.value,
      password: password.value
    })
    if (res.data.success) {
      authStore.login(res.data.data)
      router.push('/admin/dashboard')
    }
  } catch (e) {
    error.value = e.response?.data?.error || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
}

.login-container {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.login-header p {
  opacity: 0.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
}

.form-input {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
}

.btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #f44336;
  text-align: center;
}

.login-hint {
  text-align: center;
  margin-top: 16px;
  font-size: 0.875rem;
  opacity: 0.6;
}
</style>