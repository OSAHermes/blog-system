<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar__header">
        <h2 class="admin-sidebar__title">管理后台</h2>
      </div>
      <nav class="admin-sidebar__nav">
        <router-link to="/admin/dashboard" class="admin-sidebar__link" exact-active-class="active">
          📊 统计概览
        </router-link>
        <router-link to="/admin/articles" class="admin-sidebar__link" exact-active-class="active">
          📝 文章管理
        </router-link>
        <router-link to="/admin/categories" class="admin-sidebar__link" exact-active-class="active">
          📁 分类管理
        </router-link>
        <router-link to="/admin/tags" class="admin-sidebar__link" exact-active-class="active">
          🏷️ 标签管理
        </router-link>
        <router-link to="/admin/links" class="admin-sidebar__link" exact-active-class="active">
          🔗 友链管理
        </router-link>
        <a href="/" class="admin-sidebar__link" target="_blank">
          🌐 访问前台
        </a>
      </nav>
      <div class="admin-sidebar__footer">
        <button @click="handleLogout" class="admin-sidebar__logout">退出登录</button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <h1 class="admin-header__title">{{ $route.meta.title || '管理后台' }}</h1>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.isAuthenticated()) {
    router.push('/admin')
  }
})

function handleLogout() {
  authStore.logout()
  router.push('/admin')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
}

.admin-sidebar {
  width: 240px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.admin-sidebar__header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.admin-sidebar__title {
  font-size: 1.25rem;
  font-weight: bold;
}

.admin-sidebar__nav {
  flex: 1;
  padding: 12px;
}

.admin-sidebar__link {
  display: block;
  padding: 12px 16px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.admin-sidebar__link:hover,
.admin-sidebar__link.active {
  background: var(--primary-color);
  color: #fff;
}

.admin-sidebar__footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.admin-sidebar__logout {
  width: 100%;
  padding: 10px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.admin-sidebar__logout:hover {
  background: #f44336;
  color: #fff;
  border-color: #f44336;
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.admin-header {
  padding: 20px 32px;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
}

.admin-header__title {
  font-size: 1.5rem;
}

.admin-content {
  flex: 1;
  padding: 32px;
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 60px;
  }

  .admin-sidebar__title,
  .admin-sidebar__link span,
  .admin-sidebar__logout {
    display: none;
  }

  .admin-sidebar__link {
    text-align: center;
    padding: 12px;
  }

  .admin-main {
    margin-left: 60px;
  }
}
</style>