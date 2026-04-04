import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transactionsApi } from '@/api/transactions'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const pagination = ref({})
  const report = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchTransactions(params = { page: 0, size: 10, sort: 'date', direction: 'desc' }) {
    loading.value = true
    error.value = null
    try {
      const { data } = await transactionsApi.list(params)
      transactions.value = data.content
      pagination.value = {
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        size: data.size,
        number: data.number,
        first: data.first,
        last: data.last
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao carregar transações'
    } finally {
      loading.value = false
    }
  }

  async function fetchReport(mes, ano) {
    try {
      const params = {}
      if (mes) params.mes = mes
      if (ano) params.ano = ano
      const { data } = await transactionsApi.report(params)
      report.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao carregar relatório'
    }
  }

  async function createTransaction(data) {
    const res = await transactionsApi.create(data)
    // Aguarda o worker assíncrono do backend categorizar após o commit
    await new Promise(resolve => setTimeout(resolve, 1000))
    await fetchTransactions()
    return res.data
  }

  async function updateTransaction(id, data) {
    const res = await transactionsApi.update(id, data)
    await fetchTransactions()
    return res.data
  }

  async function deleteTransaction(id) {
    await transactionsApi.delete(id)
    await fetchTransactions()
  }

  return {
    transactions, pagination, report, loading, error,
    fetchTransactions, fetchReport, createTransaction, updateTransaction, deleteTransaction
  }
})
