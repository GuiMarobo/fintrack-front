<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { usersApi } from '@/api/users'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ name: '', email: '' })
const passwordForm = ref({ password: '' })
const loading = ref(false)
const message = ref('')
const error = ref('')
const showDeleteConfirm = ref(false)

onMounted(() => {
  if (auth.user) {
    form.value.name = auth.user.name
    form.value.email = auth.user.email
  }
})

async function handleUpdate() {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    await usersApi.patchMe(form.value)
    await auth.fetchUser()
    message.value = 'Dados atualizados com sucesso!'
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao atualizar'
  } finally {
    loading.value = false
  }
}

async function handlePasswordChange() {
  if (!passwordForm.value.password || passwordForm.value.password.length < 6) {
    error.value = 'A senha deve ter no mínimo 6 caracteres'
    return
  }
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    await usersApi.patchMe({ password: passwordForm.value.password })
    passwordForm.value.password = ''
    message.value = 'Senha alterada com sucesso!'
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao alterar senha'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  try {
    await usersApi.deleteMe()
    auth.logout()
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao excluir conta'
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Perfil</h1>
        <p class="page-subtitle">Gerencie seus dados pessoais</p>
      </div>
    </header>

    <div class="profile-grid">
      <!-- User Info Card -->
      <div class="profile-card">
        <div class="card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>Informações Pessoais</h3>
        </div>
        <div class="avatar-section">
          <div class="avatar">
            {{ (auth.user?.name || 'U').charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="user-name">{{ auth.user?.name }}</p>
            <p class="user-email">{{ auth.user?.email }}</p>
          </div>
        </div>

        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.name" type="text" placeholder="Seu nome" required />
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input v-model="form.email" type="email" placeholder="seu@email.com" required />
          </div>
          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Salvar Alterações</span>
          </button>
        </form>
      </div>

      <!-- Password Card -->
      <div class="profile-card">
        <div class="card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h3>Alterar Senha</h3>
        </div>
        <form @submit.prevent="handlePasswordChange">
          <div class="form-group">
            <label>Nova Senha</label>
            <input v-model="passwordForm.password" type="password" placeholder="Mínimo 6 caracteres" minlength="6" required />
          </div>
          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Alterar Senha</span>
          </button>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="profile-card danger-zone">
        <div class="card-header danger">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h3>Zona de Perigo</h3>
        </div>
        <p class="danger-text">
          Ao excluir sua conta, todos os dados serão permanentemente removidos. Esta ação não pode ser desfeita.
        </p>
        <button v-if="!showDeleteConfirm" class="btn-danger" @click="showDeleteConfirm = true">
          Excluir Minha Conta
        </button>
        <div v-else class="delete-confirm">
          <p>Tem certeza? Isso não pode ser desfeito.</p>
          <div class="confirm-actions">
            <button class="btn-secondary" @click="showDeleteConfirm = false">Cancelar</button>
            <button class="btn-danger" @click="handleDelete">Sim, Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Messages -->
    <transition name="toast">
      <p v-if="message" class="toast success">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ message }}
      </p>
    </transition>
    <transition name="toast">
      <p v-if="error" class="toast error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {{ error }}
      </p>
    </transition>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem 2.5rem;
  max-width: 720px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.4px;
}

.page-subtitle {
  color: var(--text-muted);
  margin-top: 0.2rem;
  font-size: 0.82rem;
}

.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  color: var(--text-muted);
}

.card-header h3 {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.card-header.danger {
  color: #ff5c6c;
}

.card-header.danger h3 {
  color: #ff5c6c;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(206, 255, 0, 0.1);
}

.user-name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.user-email {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.form-group {
  margin-bottom: 1.1rem;
}

.form-group label {
  display: block;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: rgba(206, 255, 0, 0.35);
  box-shadow: 0 0 0 3px rgba(206, 255, 0, 0.06);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1.25rem;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  padding: 0.7rem 1.15rem;
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s;
}

.btn-secondary:hover { border-color: var(--text-muted); }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: var(--bg-primary);
  border-radius: 50%;
  animation: spin 0.5s linear infinite;
}

.danger-zone {
  border-color: rgba(255, 92, 108, 0.15);
}

.danger-text {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
  line-height: 1.55;
}

.btn-danger {
  padding: 0.7rem 1.25rem;
  background: rgba(255, 92, 108, 0.08);
  color: #ff5c6c;
  border: 1px solid rgba(255, 92, 108, 0.2);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-danger:hover {
  background: rgba(255, 92, 108, 0.15);
  border-color: rgba(255, 92, 108, 0.35);
}

.delete-confirm p {
  color: #ff5c6c;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 500;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.toast.success {
  background: rgba(206, 255, 0, 0.1);
  color: var(--accent);
  border: 1px solid rgba(206, 255, 0, 0.15);
  backdrop-filter: blur(12px);
}

.toast.error {
  background: rgba(255, 92, 108, 0.1);
  color: #ff5c6c;
  border: 1px solid rgba(255, 92, 108, 0.15);
  backdrop-filter: blur(12px);
}

.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { transform: translateX(-50%) translateY(20px); opacity: 0; }
.toast-leave-to { transform: translateX(-50%) translateY(10px); opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .page { padding: 1.25rem; }
}
</style>
