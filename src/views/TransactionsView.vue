<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTransactionsStore } from '@/store/transactions'
import { useAccountsStore } from '@/store/accounts'

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
    <header class="page-header">
      <div>
        <h1>Transações</h1>
        <p class="page-subtitle">{{ store.pagination.totalElements || 0 }} transações registradas</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Transação
      </button>
    </header>

    <div v-if="store.loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Carregando...</span>
    </div>

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
              <span class="amount" :class="t.type === 'ENTRADA' ? 'income' : 'expense'">
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

      <!-- Pagination -->
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

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      </div>
      <h3>Nenhuma transação registrada</h3>
      <p>Crie sua primeira transação</p>
      <button class="btn-primary" @click="openCreate">Nova Transação</button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <h2>{{ editingId ? 'Editar Transação' : 'Nova Transação' }}</h2>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label>Descrição</label>
                <input v-model="form.description" type="text" placeholder="Ex: Supermercado" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Valor</label>
                  <input v-model="form.amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
                </div>
                <div class="form-group">
                  <label>Tipo</label>
                  <select v-model="form.type" required>
                    <option value="DESPESA">Despesa</option>
                    <option value="ENTRADA">Entrada</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Data</label>
                  <input v-model="form.date" type="date" required />
                </div>
                <div class="form-group">
                  <label>Conta</label>
                  <select v-model="form.account.id" required>
                    <option value="" disabled>Selecione</option>
                    <option v-for="a in accountsStore.accounts" :key="a.id" :value="a.id">
                      {{ a.bankName }}
                    </option>
                  </select>
                </div>
              </div>
              <p v-if="formError" class="error-message">{{ formError }}</p>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
                <button type="submit" class="btn-primary">{{ editingId ? 'Salvar' : 'Criar' }}</button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.15rem;
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

.btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  padding: 0.65rem 1.15rem;
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

/* Table */
.transactions-table-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th {
  text-align: left;
  padding: 0.85rem 1.25rem;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 1px solid var(--border-color);
}

.transactions-table td {
  padding: 0.75rem 1.25rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-subtle);
}

.transactions-table tr:last-child td {
  border-bottom: none;
}

.transactions-table tbody tr {
  transition: background 0.1s;
}

.transactions-table tbody tr:hover td {
  background: var(--bg-hover);
}

.desc-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 500;
}

.type-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-dot.income { background: var(--accent); box-shadow: 0 0 6px rgba(206, 255, 0, 0.3); }
.type-dot.expense { background: #ff5c6c; box-shadow: 0 0 6px rgba(255, 92, 108, 0.3); }

.type-tag {
  display: inline-block;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.type-tag.income {
  background: rgba(206, 255, 0, 0.08);
  color: var(--accent);
}

.type-tag.expense {
  background: rgba(255, 92, 108, 0.08);
  color: #ff5c6c;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}

.category-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cell-muted {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.amount {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.amount.income { color: var(--accent); }
.amount.expense { color: #ff5c6c; }

.row-actions {
  display: flex;
  gap: 0.3rem;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.02);
}

.icon-btn.confirming {
  border-color: #ff5c6c;
  color: #ff5c6c;
  background: rgba(255, 92, 108, 0.08);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.85rem;
  border-top: 1px solid var(--border-subtle);
}

.page-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: rgba(206, 255, 0, 0.3);
  color: var(--accent);
}

.page-btn.active {
  background: var(--accent);
  color: var(--bg-primary);
  border-color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* Loading */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
}

.empty-icon {
  width: 72px;
  height: 72px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: var(--text-muted);
}

.empty-state h3 {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
  letter-spacing: -0.2px;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
}

.modal h2 {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  letter-spacing: -0.3px;
}

.form-group {
  margin-bottom: 1.1rem;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 0.85rem;
}

.form-group label {
  display: block;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.form-group input, .form-group select {
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

.form-group input:focus, .form-group select:focus {
  border-color: rgba(206, 255, 0, 0.35);
  box-shadow: 0 0 0 3px rgba(206, 255, 0, 0.06);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.form-group select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.error-message {
  color: #ff5c6c;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
  padding: 0.6rem;
  background: rgba(255, 92, 108, 0.06);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 92, 108, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

/* Transitions */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-leave-active .modal { transition: transform 0.15s ease, opacity 0.15s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.96); opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal { transform: scale(0.96); opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page { padding: 1.25rem; }
  .page-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .transactions-table-wrapper { overflow-x: auto; }
  .form-row { flex-direction: column; gap: 0; }
}
</style>
