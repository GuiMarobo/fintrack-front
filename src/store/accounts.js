import { defineStore } from 'pinia'
import { ref } from 'vue'
import { accountsApi } from '@/api/accounts'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref([])
  const pagination = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchAccounts(params = { page: 0, size: 100, sort: 'bankName', direction: 'asc' }) {
    loading.value = true
    error.value = null
    try {
      const { data } = await accountsApi.list(params)
      accounts.value = data.content
      pagination.value = {
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        size: data.size,
        number: data.number,
        first: data.first,
        last: data.last
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao carregar contas'
    } finally {
      loading.value = false
    }
  }

  async function createAccount(data) {
    const res = await accountsApi.create(data)
    await fetchAccounts()
    return res.data
  }

  async function updateAccount(id, data) {
    const res = await accountsApi.update(id, data)
    await fetchAccounts()
    return res.data
  }

  async function deleteAccount(id) {
    await accountsApi.delete(id)
    await fetchAccounts()
  }

  return { accounts, pagination, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount }
})
