import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { usersApi } from '@/api/users'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('fintrack_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('fintrack_user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.login(credentials)
      token.value = data.token
      localStorage.setItem('fintrack_token', data.token)
      await fetchUser()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao fazer login'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    loading.value = true
    error.value = null
    try {
      await authApi.register(data)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao registrar'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    try {
      const { data } = await usersApi.getMe()
      user.value = data
      localStorage.setItem('fintrack_user', JSON.stringify(data))
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('fintrack_token')
    localStorage.removeItem('fintrack_user')
  }

  return { token, user, loading, error, isAuthenticated, login, register, fetchUser, logout }
})
