<template>
  <header class="header" :class="{ 'header--scrolled': isScrolled }">
    <div class="container header__container">
      <router-link to="/" class="header__logo">
        <span class="header__logo-icon">📝</span>
        <span class="header__logo-text">{{ siteName }}</span>
      </router-link>

      <nav class="header__nav">
        <router-link to="/" class="header__link" exact-active-class="header__link--active">首页</router-link>
        <router-link to="/categories" class="header__link" exact-active-class="header__link--active">分类</router-link>
        <router-link to="/tags" class="header__link" exact-active-class="header__link--active">标签</router-link>
        <router-link to="/links" class="header__link" exact-active-class="header__link--active">友链</router-link>
      </nav>

      <div class="header__actions">
        <button class="header__search-btn" @click="openSearch">🔍</button>
        <div class="header__theme-wrapper">
          <button class="header__theme-btn" @click="toggleThemeMenu">
            {{ currentTheme?.icon }}
          </button>
          <div v-if="showThemeMenu" class="header__theme-menu">
            <button
              v-for="t in themes"
              :key="t.id"
              class="header__theme-option"
              :class="{ 'header__theme-option--active': theme === t.id }"
              @click="selectTheme(t.id)"
            >
              {{ t.icon }} {{ t.name }}
            </button>
          </div>
        </div>
        <router-link to="/admin" class="header__admin-btn">管理</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import axios from 'axios'

const router = useRouter()
const themeStore = useThemeStore()

const theme = computed(() => themeStore.theme)
const themes = computed(() => themeStore.themes)
const currentTheme = computed(() => themeStore.themes.find(t => t.id === theme.value))

const siteName = ref('个人博客')
const isScrolled = ref(false)
const showThemeMenu = ref(false)

async function fetchSettings() {
  try {
    const res = await axios.get('/api/v1/public/settings')
    if (res.data.success) {
      siteName.value = res.data.data.site_name || '个人博客'
    }
  } catch (e) {
    console.error('Failed to fetch settings', e)
  }
}

function toggleThemeMenu() {
  showThemeMenu.value = !showThemeMenu.value
}

function selectTheme(id) {
  themeStore.setTheme(id)
  showThemeMenu.value = false
}

function openSearch() {
  router.push('/search')
}

function handleClickOutside(e) {
  if (!e.target.closest('.header__theme-wrapper')) {
    showThemeMenu.value = false
  }
}

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  fetchSettings()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  transition: box-shadow 0.3s;
}

.header--scrolled {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header__container {
  display: flex;
  align-items: center;
  height: 60px;
  gap: 20px;
}

.header__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
}

.header__logo-icon {
  font-size: 1.5rem;
}

.header__nav {
  display: flex;
  gap: 20px;
  flex: 1;
}

.header__link {
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.header__link:hover,
.header__link--active {
  background: var(--primary-color);
  color: #fff;
  text-decoration: none;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__search-btn,
.header__theme-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.header__search-btn:hover,
.header__theme-btn:hover {
  background: var(--border-color);
}

.header__theme-wrapper {
  position: relative;
}

.header__theme-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 120px;
  overflow: hidden;
}

.header__theme-option {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-color);
  transition: background 0.2s;
}

.header__theme-option:hover {
  background: var(--border-color);
}

.header__theme-option--active {
  background: var(--primary-color);
  color: #fff;
}

.header__admin-btn {
  background: var(--primary-color);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.header__admin-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .header__nav {
    display: none;
  }
}
</style>