<script setup>
import { ref, onMounted } from 'vue'
import { useAccountsStore } from '@/store/accounts'

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
    <header class="page-header">
      <div>
        <h1>Contas</h1>
        <p class="page-subtitle">Gerencie suas contas bancárias</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Conta
      </button>
    </header>

    <div v-if="store.loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Carregando...</span>
    </div>

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

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </div>
      <h3>Nenhuma conta cadastrada</h3>
      <p>Crie sua primeira conta para começar</p>
      <button class="btn-primary" @click="openCreate">Criar Conta</button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <h2>{{ editingId ? 'Editar Conta' : 'Nova Conta' }}</h2>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label>Nome do Banco</label>
                <input v-model="form.bankName" type="text" placeholder="Ex: Nubank" required />
              </div>
              <div class="form-group">
                <label>Tipo da Conta</label>
                <input v-model="form.accountType" type="text" placeholder="Ex: Corrente" required />
              </div>
              <div class="form-group">
                <label>Saldo Inicial</label>
                <input v-model="form.balance" type="number" step="0.01" placeholder="0.00" required />
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

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.account-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.account-card:hover {
  border-color: rgba(206, 255, 0, 0.12);
  box-shadow: 0 0 24px rgba(206, 255, 0, 0.03);
}

.account-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.bank-icon {
  width: 42px;
  height: 42px;
  background: rgba(206, 255, 0, 0.07);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.account-actions {
  display: flex;
  gap: 0.4rem;
}

.icon-btn {
  width: 30px;
  height: 30px;
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

.bank-name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.45rem;
  letter-spacing: -0.2px;
}

.account-type-tag {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  background: rgba(206, 255, 0, 0.07);
  color: var(--accent);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-bottom: 1.15rem;
  letter-spacing: 0.2px;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.balance-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.balance-value {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.balance-value.positive { color: var(--accent); }
.balance-value.negative { color: #ff5c6c; }

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
  max-width: 420px;
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

@media (max-width: 640px) {
  .page { padding: 1.25rem; }
  .accounts-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
}
</style>
