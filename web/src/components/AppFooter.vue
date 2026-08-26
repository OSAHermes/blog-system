<template>
  <footer class="footer">
    <div class="container footer__container">
      <div class="footer__content">
        <p class="footer__copyright">{{ footerText }}</p>
        <p class="footer__powered">Powered by Vue 3 + Express</p>
      </div>
      <div class="footer__links">
        <router-link to="/admin" class="footer__link">管理后台</router-link>
        <a href="https://github.com" class="footer__link" target="_blank">GitHub</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const footerText = ref('© 2024 个人博客. All rights reserved.')

async function fetchSettings() {
  try {
    const res = await axios.get('/api/v1/public/settings')
    if (res.data.success) {
      footerText.value = res.data.data.footer_text || footerText.value
    }
  } catch (e) {
    console.error('Failed to fetch settings', e)
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.footer {
  background: var(--footer-bg);
  border-top: 1px solid var(--border-color);
  padding: 40px 0;
  margin-top: 60px;
}

.footer__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer__content {
  color: var(--text-color);
  opacity: 0.8;
}

.footer__copyright {
  margin-bottom: 4px;
}

.footer__powered {
  font-size: 0.875rem;
  opacity: 0.6;
}

.footer__links {
  display: flex;
  gap: 20px;
}

.footer__link {
  color: var(--text-color);
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.footer__link:hover {
  opacity: 1;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer__container {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>