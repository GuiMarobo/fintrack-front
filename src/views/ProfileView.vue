<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { usersApi } from '@/api/users'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import FormField from '@/components/ui/FormField.vue'
import AppToast from '@/components/ui/AppToast.vue'

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
  <div class="profile-page">
    <PageHeader title="Perfil" subtitle="Gerencie seus dados pessoais" />

    <div class="profile-grid">
      <!-- Informações Pessoais -->
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
          <FormField label="Nome">
            <input v-model="form.name" type="text" placeholder="Seu nome" required />
          </FormField>
          <FormField label="E-mail">
            <input v-model="form.email" type="email" placeholder="seu@email.com" required />
          </FormField>
          <AppButton type="submit" :loading="loading">Salvar Alterações</AppButton>
        </form>
      </div>

      <!-- Alterar Senha -->
      <div class="profile-card">
        <div class="card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h3>Alterar Senha</h3>
        </div>
        <form @submit.prevent="handlePasswordChange">
          <FormField label="Nova Senha">
            <input v-model="passwordForm.password" type="password" placeholder="Mínimo 6 caracteres" minlength="6" required />
          </FormField>
          <AppButton type="submit" :loading="loading">Alterar Senha</AppButton>
        </form>
      </div>

      <!-- Zona de Perigo -->
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
        <AppButton v-if="!showDeleteConfirm" variant="danger" @click="showDeleteConfirm = true">
          Excluir Minha Conta
        </AppButton>
        <div v-else class="delete-confirm">
          <p>Tem certeza? Isso não pode ser desfeito.</p>
          <div class="confirm-actions">
            <AppButton variant="secondary" @click="showDeleteConfirm = false">Cancelar</AppButton>
            <AppButton variant="danger" @click="handleDelete">Sim, Excluir</AppButton>
          </div>
        </div>
      </div>
    </div>

    <AppToast :message="message" type="success" />
    <AppToast :message="error" type="error" />
  </div>
</template>
