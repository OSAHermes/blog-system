import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  const themes = [
    { id: 'light', name: '亮色', icon: '☀️' },
    { id: 'dark', name: '暗色', icon: '🌙' },
    { id: 'blue', name: '蓝色', icon: '💙' },
    { id: 'green', name: '绿色', icon: '💚' }
  ]

  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function loadTheme() {
    const saved = localStorage.getItem('theme') || 'light'
    theme.value = saved
    document.documentElement.setAttribute('data-theme', saved)
  }

  return { theme, themes, setTheme, loadTheme }
})