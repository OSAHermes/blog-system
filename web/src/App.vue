<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
onMounted(() => {
  themeStore.loadTheme()
})
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --primary-color: #409eff;
  --border-color: #e4e7ed;
  --card-bg: #ffffff;
  --header-bg: #ffffff;
  --footer-bg: #f5f7fa;
}

[data-theme='dark'] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --primary-color: #409eff;
  --border-color: #4a4a4a;
  --card-bg: #252525;
  --header-bg: #252525;
  --footer-bg: #1f1f1f;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
  transition: background-color 0.3s, color 0.3s;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>