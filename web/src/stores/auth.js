import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  function login(result) {
    token.value = result.token
    user.value = result.user
    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function isAuthenticated() {
    return !!token.value
  }

  return { token, user, login, logout, isAuthenticated }
})