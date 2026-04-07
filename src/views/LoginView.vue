<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()
const form = ref({ email: '', password: '' })
const showPassword = ref(false)

async function handleLogin() {
  const success = await auth.login(form.value)
  if (success) router.push('/')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-glow"></div>
    <div class="auth-container">
      <div class="auth-brand">
        <div class="auth-brand-mark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1>Fintrack</h1>
      </div>

      <div class="auth-card">
        <h2>Bem-vindo de volta</h2>
        <p class="auth-sub">Entre na sua conta para continuar</p>

        <form @submit.prevent="handleLogin">
          <div class="auth-field">
            <label for="email">E-mail</label>
            <input id="email" v-model="form.email" type="email" placeholder="seu@email.com" required autocomplete="email" />
          </div>
          <div class="auth-field">
            <label for="password">Senha</label>
            <div class="auth-input-box">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Sua senha" required autocomplete="current-password" />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <p v-if="auth.error" class="auth-error">{{ auth.error }}</p>

          <button type="submit" class="auth-submit" :disabled="auth.loading">
            <span v-if="auth.loading" class="auth-spinner"></span>
            <span v-else>Entrar</span>
          </button>
        </form>

        <p class="auth-footer">Não tem uma conta? <router-link to="/register">Criar conta</router-link></p>
      </div>
    </div>
  </div>
</template>
