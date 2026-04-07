<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTransactionsStore } from '@/store/transactions'
import { useAccountsStore } from '@/store/accounts'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import FormField from '@/components/ui/FormField.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const store = useTransactionsStore()
const accountsStore = useAccountsStore()

const showModal = ref(false)
const editingId = ref(null)
const form = ref({
  description: '',
  amount: '',
  type: 'DESPESA',
  date: new Date().toISOString().split('T')[0],
  account: { id: '' }
})
const formError = ref('')
const deleting = ref(null)

const currentPage = ref(0)
const pageSize = ref(10)

const totalPages = computed(() => store.pagination.totalPages || 0)

function openCreate() {
  editingId.value = null
  form.value = {
    description: '',
    amount: '',
    type: 'DESPESA',
    date: new Date().toISOString().split('T')[0],
    account: { id: accountsStore.accounts[0]?.id || '' }
  }
  formError.value = ''
  showModal.value = true
}

function openEdit(t) {
  editingId.value = t.id
  form.value = {
    description: t.description,
    amount: String(t.amount),
    type: t.type,
    date: t.date,
    account: { id: t.accountId }
  }
  formError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  formError.value = ''
  try {
    const data = {
      description: form.value.description,
      amount: Number(form.value.amount),
      type: form.value.type,
      date: form.value.date,
      account: { id: Number(form.value.account.id) }
    }
    if (editingId.value) {
      await store.updateTransaction(editingId.value, data)
    } else {
      await store.createTransaction(data)
    }
    showModal.value = false
  } catch (err) {
    formError.value = err.response?.data?.message || 'Erro ao salvar transação'
  }
}

async function handleDelete(id) {
  if (deleting.value === id) {
    try {
      await store.deleteTransaction(id)
      loadPage(currentPage.value)
    } catch (err) {
      formError.value = err.response?.data?.message || 'Erro ao excluir'
    }
    deleting.value = null
  } else {
    deleting.value = id
    setTimeout(() => { if (deleting.value === id) deleting.value = null }, 3000)
  }
}

function loadPage(page) {
  currentPage.value = page
  store.fetchTransactions({ page, size: pageSize.value, sort: 'date', direction: 'desc' })
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const categoryMap = {
  ALIMENTACAO: 'Alimentação',
  TRANSPORTE: 'Transporte',
  MORADIA: 'Moradia',
  LAZER: 'Lazer',
  OUTROS: 'Outros'
}

const categoryColors = {
  ALIMENTACAO: '#ceff00',
  TRANSPORTE: '#7c6cf0',
  MORADIA: '#00d4aa',
  LAZER: '#ff6eb4',
  OUTROS: '#555570'
}

onMounted(() => {
  loadPage(0)
  accountsStore.fetchAccounts()
})
</script>

<template>
  <div class="page">
    <PageHeader title="Transações" :subtitle="`${store.pagination.totalElements || 0} transações registradas`">
      <AppButton @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Transação
      </AppButton>
    </PageHeader>

    <LoadingState v-if="store.loading" />

    <div v-else-if="store.transactions.length" class="transactions-table-wrapper">
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Conta</th>
            <th>Data</th>
            <th>Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in store.transactions" :key="t.id">
            <td>
              <div class="desc-cell">
                <div class="type-dot" :class="t.type === 'ENTRADA' ? 'income' : 'expense'"></div>
                {{ t.description }}
              </div>
            </td>
            <td>
              <span class="type-tag" :class="t.type === 'ENTRADA' ? 'income' : 'expense'">
                {{ t.type === 'ENTRADA' ? 'Entrada' : 'Despesa' }}
              </span>
            </td>
            <td>
              <span class="category-tag" :style="{ color: categoryColors[t.category] || '#555570' }">
                <span class="category-dot" :style="{ background: categoryColors[t.category] || '#555570' }"></span>
                {{ categoryMap[t.category] || t.category || '-' }}
              </span>
            </td>
            <td class="cell-muted">{{ t.accountBankName }}</td>
            <td class="cell-muted">{{ formatDate(t.date) }}</td>
            <td>
              <span class="tx-amount" :class="t.type === 'ENTRADA' ? 'income' : 'expense'">
                {{ t.type === 'ENTRADA' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" @click="openEdit(t)" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  class="icon-btn"
                  :class="{ confirming: deleting === t.id }"
                  @click="handleDelete(t.id)"
                  :title="deleting === t.id ? 'Confirmar exclusão' : 'Excluir'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 0" @click="loadPage(currentPage - 1)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <template v-for="p in totalPages" :key="p">
          <button class="page-btn" :class="{ active: currentPage === p - 1 }" @click="loadPage(p - 1)">
            {{ p }}
          </button>
        </template>
        <button class="page-btn" :disabled="currentPage === totalPages - 1" @click="loadPage(currentPage + 1)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>

    <EmptyState
      v-else
      title="Nenhuma transação registrada"
      description="Crie sua primeira transação"
    >
      <template #icon>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      </template>
      <template #action>
        <AppButton @click="openCreate">Nova Transação</AppButton>
      </template>
    </EmptyState>

    <AppModal :show="showModal" max-width="480px" @close="showModal = false">
      <h2>{{ editingId ? 'Editar Transação' : 'Nova Transação' }}</h2>
      <form @submit.prevent="handleSubmit">
        <FormField label="Descrição">
          <input v-model="form.description" type="text" placeholder="Ex: Supermercado" required />
        </FormField>
        <div class="form-row">
          <FormField label="Valor">
            <input v-model="form.amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
          </FormField>
          <FormField label="Tipo">
            <select v-model="form.type" required>
              <option value="DESPESA">Despesa</option>
              <option value="ENTRADA">Entrada</option>
            </select>
          </FormField>
        </div>
        <div class="form-row">
          <FormField label="Data">
            <input v-model="form.date" type="date" required />
          </FormField>
          <FormField label="Conta">
            <select v-model="form.account.id" required>
              <option value="" disabled>Selecione</option>
              <option v-for="a in accountsStore.accounts" :key="a.id" :value="a.id">
                {{ a.bankName }}
              </option>
            </select>
          </FormField>
        </div>
        <p v-if="formError" class="error-message">{{ formError }}</p>
        <div class="modal-actions">
          <AppButton variant="secondary" @click="showModal = false">Cancelar</AppButton>
          <AppButton type="submit">{{ editingId ? 'Salvar' : 'Criar' }}</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
