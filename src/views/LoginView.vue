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
        <div class="brand-mark">
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
          <div class="field">
            <label for="email">E-mail</label>
            <input id="email" v-model="form.email" type="email" placeholder="seu@email.com" required autocomplete="email" />
          </div>
          <div class="field">
            <label for="password">Senha</label>
            <div class="input-box">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Sua senha" required autocomplete="current-password" />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <p v-if="auth.error" class="err">{{ auth.error }}</p>

          <button type="submit" class="submit-btn" :disabled="auth.loading">
            <span v-if="auth.loading" class="spinner"></span>
            <span v-else>Entrar</span>
          </button>
        </form>

        <p class="auth-footer">Não tem uma conta? <router-link to="/register">Criar conta</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.auth-glow {
  position: absolute;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(206,255,0,0.06) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -60%);
  pointer-events: none;
}

.auth-container { width: 100%; max-width: 400px; position: relative; z-index: 1; }

.auth-brand {
  display: flex; align-items: center; gap: 0.65rem;
  justify-content: center; margin-bottom: 2.5rem;
}
.brand-mark {
  width: 44px; height: 44px;
  background: var(--accent); border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  color: var(--bg-primary);
  box-shadow: 0 0 30px rgba(206,255,0,0.12), 0 0 8px rgba(206,255,0,0.15);
}
.auth-brand h1 {
  font-family: var(--font-display);
  font-size: 1.6rem; font-weight: 700;
  letter-spacing: -0.5px;
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 2.25rem;
}
.auth-card h2 {
  font-family: var(--font-display);
  font-size: 1.35rem; font-weight: 700; margin-bottom: 0.35rem;
  letter-spacing: -0.3px;
}
.auth-sub { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.75rem; }

.field { margin-bottom: 1.15rem; }
.field label {
  display: block; font-size: 0.78rem; font-weight: 500;
  color: var(--text-secondary); margin-bottom: 0.4rem;
}
.field input, .input-box input {
  width: 100%; padding: 0.75rem 0.9rem;
  background: var(--bg-input); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); color: var(--text-primary);
  font-size: 0.88rem; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field input:focus, .input-box input:focus {
  border-color: rgba(206,255,0,0.35);
  box-shadow: 0 0 0 3px rgba(206,255,0,0.06);
}
.field input::placeholder, .input-box input::placeholder { color: var(--text-muted); }

.input-box { position: relative; }
.input-box input { padding-right: 2.75rem; }
.eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; padding: 4px; display: flex;
}
.eye-btn:hover { color: var(--text-secondary); }

.err {
  color: #ff5c6c; font-size: 0.8rem; margin-bottom: 0.75rem;
  padding: 0.65rem; background: rgba(255,92,108,0.06);
  border-radius: var(--radius-sm); border: 1px solid rgba(255,92,108,0.1);
}

.submit-btn {
  width: 100%; padding: 0.8rem;
  background: var(--accent); color: var(--bg-primary);
  border: none; border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: opacity 0.15s, transform 0.1s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px; border: 2px solid transparent;
  border-top-color: var(--bg-primary); border-radius: 50%;
  animation: spin 0.5s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer {
  text-align: center; margin-top: 1.5rem;
  font-size: 0.82rem; color: var(--text-muted);
}
.auth-footer a { color: var(--accent); font-weight: 600; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
</style>
