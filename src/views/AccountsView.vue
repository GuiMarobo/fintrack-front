<script setup>
import { ref, onMounted } from 'vue'
import { useAccountsStore } from '@/store/accounts'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import FormField from '@/components/ui/FormField.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const store = useAccountsStore()

const showModal = ref(false)
const editingId = ref(null)
const form = ref({ bankName: '', accountType: '', balance: '' })
const formError = ref('')
const deleting = ref(null)

function openCreate() {
  editingId.value = null
  form.value = { bankName: '', accountType: '', balance: '' }
  formError.value = ''
  showModal.value = true
}

function openEdit(account) {
  editingId.value = account.id
  form.value = { bankName: account.bankName, accountType: account.accountType, balance: String(account.balance) }
  formError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  formError.value = ''
  try {
    const data = {
      bankName: form.value.bankName,
      accountType: form.value.accountType,
      balance: Number(form.value.balance)
    }
    if (editingId.value) {
      await store.updateAccount(editingId.value, data)
    } else {
      await store.createAccount(data)
    }
    showModal.value = false
  } catch (err) {
    formError.value = err.response?.data?.message || 'Erro ao salvar conta'
  }
}

async function handleDelete(id) {
  if (deleting.value === id) {
    try {
      await store.deleteAccount(id)
    } catch (err) {
      formError.value = err.response?.data?.message || 'Erro ao excluir'
    }
    deleting.value = null
  } else {
    deleting.value = id
    setTimeout(() => { if (deleting.value === id) deleting.value = null }, 3000)
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

onMounted(() => store.fetchAccounts())
</script>

<template>
  <div class="page">
    <PageHeader title="Contas" subtitle="Gerencie suas contas bancárias">
      <AppButton @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Conta
      </AppButton>
    </PageHeader>

    <LoadingState v-if="store.loading" />

    <div v-else-if="store.accounts.length" class="accounts-grid">
      <div v-for="account in store.accounts" :key="account.id" class="account-card">
        <div class="account-card-header">
          <div class="bank-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div class="account-actions">
            <button class="icon-btn" @click="openEdit(account)" title="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              class="icon-btn"
              :class="{ confirming: deleting === account.id }"
              @click="handleDelete(account.id)"
              :title="deleting === account.id ? 'Clique novamente para confirmar' : 'Excluir'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        <h3 class="bank-name">{{ account.bankName }}</h3>
        <span class="account-type-tag">{{ account.accountType }}</span>
        <div class="balance-row">
          <span class="balance-label">Saldo</span>
          <span class="balance-value" :class="Number(account.balance) >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(account.balance) }}
          </span>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      title="Nenhuma conta cadastrada"
      description="Crie sua primeira conta para começar"
    >
      <template #icon>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </template>
      <template #action>
        <AppButton @click="openCreate">Criar Conta</AppButton>
      </template>
    </EmptyState>

    <AppModal :show="showModal" max-width="420px" @close="showModal = false">
      <h2>{{ editingId ? 'Editar Conta' : 'Nova Conta' }}</h2>
      <form @submit.prevent="handleSubmit">
        <FormField label="Nome do Banco">
          <input v-model="form.bankName" type="text" placeholder="Ex: Nubank" required />
        </FormField>
        <FormField label="Tipo da Conta">
          <input v-model="form.accountType" type="text" placeholder="Ex: Corrente" required />
        </FormField>
        <FormField label="Saldo Inicial">
          <input v-model="form.balance" type="number" step="0.01" placeholder="0.00" required />
        </FormField>
        <p v-if="formError" class="error-message">{{ formError }}</p>
        <div class="modal-actions">
          <AppButton variant="secondary" @click="showModal = false">Cancelar</AppButton>
          <AppButton type="submit">{{ editingId ? 'Salvar' : 'Criar' }}</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
