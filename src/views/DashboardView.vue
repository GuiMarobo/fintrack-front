<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { useAuthStore } from '@/store/auth'
import { useAccountsStore } from '@/store/accounts'
import { useTransactionsStore } from '@/store/transactions'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const auth = useAuthStore()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()
const monthlyReports = ref([])

const totalBalance = computed(() =>
  accountsStore.accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)
)
const recentTransactions = computed(() => transactionsStore.transactions.slice(0, 4))
const limitedAccounts = computed(() => accountsStore.accounts.slice(0, 3))
const report = computed(() => transactionsStore.report)

const categoryBreakdown = computed(() => {
  const cats = {}
  transactionsStore.transactions.forEach(t => {
    if (t.type === 'DESPESA') {
      const cat = t.category || 'OUTROS'
      cats[cat] = (cats[cat] || 0) + Number(t.amount)
    }
  })
  return cats
})

const categoryColors = { ALIMENTACAO: '#ceff00', TRANSPORTE: '#7c6cf0', MORADIA: '#00d4aa', LAZER: '#ff6eb4', OUTROS: '#555570' }
const categoryLabels = { ALIMENTACAO: 'Alimentação', TRANSPORTE: 'Transporte', MORADIA: 'Moradia', LAZER: 'Lazer', OUTROS: 'Outros' }

const categoryChartData = computed(() => {
  const keys = Object.keys(categoryBreakdown.value)
  return {
    labels: keys.map(k => categoryLabels[k] || k),
    datasets: [{ data: Object.values(categoryBreakdown.value), backgroundColor: keys.map(k => categoryColors[k] || '#555570'), borderWidth: 0 }]
  }
})

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const barChartData = computed(() => {
  const sorted = [...monthlyReports.value].sort((a, b) => a.mes - b.mes)
  return {
    labels: sorted.map(r => monthNames[r.mes - 1]),
    datasets: [
      { label: 'Entradas', data: sorted.map(r => Number(r.totalEntradas)), backgroundColor: '#ceff00', borderRadius: 5, borderSkipped: false, barPercentage: 0.6 },
      { label: 'Despesas', data: sorted.map(r => Number(r.totalDespesas)), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, borderSkipped: false, barPercentage: 0.6 }
    ]
  }
})

const barChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top', align: 'end', labels: { color: '#666', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11, family: 'DM Sans' } } },
    tooltip: { backgroundColor: '#1a1a24', titleColor: '#eee', bodyColor: '#aaa', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, cornerRadius: 10, padding: 12, titleFont: { family: 'Sora' }, callbacks: { label: ctx => `R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } }
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: '#444', font: { size: 11, family: 'DM Sans' } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, border: { display: false }, ticks: { color: '#444', font: { size: 11, family: 'DM Sans' }, callback: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v } }
  }
}

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false, cutout: '72%',
  plugins: {
    legend: { display: true, position: 'bottom', labels: { color: '#666', usePointStyle: true, pointStyle: 'circle', padding: 10, font: { size: 10, family: 'DM Sans' } } },
    tooltip: { backgroundColor: '#1a1a24', titleColor: '#eee', bodyColor: '#aaa', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, cornerRadius: 10, padding: 12, callbacks: { label: ctx => `R$ ${ctx.parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } }
  }
}

function fmt(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtDate(d) { if (!d) return ''; return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }

async function loadMonthlyReports() {
  const reports = []
  const promises = []
  for (let m = 1; m <= currentMonth; m++) {
    promises.push(transactionsStore.fetchReport(m, currentYear).then(() => { if (transactionsStore.report) reports.push({ ...transactionsStore.report }) }).catch(() => {}))
  }
  await Promise.all(promises)
  monthlyReports.value = reports
}

onMounted(async () => {
  await Promise.all([
    accountsStore.fetchAccounts(),
    transactionsStore.fetchTransactions({ page: 0, size: 20, sort: 'date', direction: 'desc' }),
    transactionsStore.fetchReport(currentMonth, currentYear)
  ])
  await loadMonthlyReports()
})
</script>

<template>
  <div class="dash">
    <!-- Header -->
    <div class="dash-top">
      <div>
        <h1>Dashboard</h1>
        <p class="greeting">Olá, {{ auth.user?.name || 'Usuário' }}</p>
      </div>
      <div class="period-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {{ monthNames[currentMonth - 1] }} {{ currentYear }}
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpis">
      <div class="kpi">
        <span class="kpi-label">Saldo Total</span>
        <p class="kpi-val">{{ fmt(totalBalance) }}</p>
        <span class="kpi-sub">{{ accountsStore.accounts.length }} conta(s)</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Entradas</span>
        <p class="kpi-val accent">{{ fmt(report?.totalEntradas) }}</p>
        <span class="kpi-sub">{{ report?.totalTransacoes || 0 }} transações</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Despesas</span>
        <p class="kpi-val red">{{ fmt(report?.totalDespesas) }}</p>
        <span class="kpi-sub">Saldo: {{ fmt(report?.saldo) }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Total Geral</span>
        <p class="kpi-val">{{ transactionsStore.pagination.totalElements || 0 }}</p>
        <span class="kpi-sub">Transações registradas</span>
      </div>
    </div>

    <!-- Grid principal -->
    <div class="dash-grid">
      <!-- Gráfico de barras -->
      <div class="tile tile-chart">
        <div class="tile-head">
          <h3>Receitas vs Despesas</h3>
          <span class="dash-pill">{{ currentYear }}</span>
        </div>
        <div class="chart-wrap">
          <Bar v-if="monthlyReports.length" :data="barChartData" :options="barChartOptions" />
          <p v-else class="empty-chart">Carregando...</p>
        </div>
      </div>

      <!-- Coluna central: transações + contas -->
      <div class="mid-stack">
        <div class="tile tile-list">
          <div class="tile-head">
            <h3>Recentes</h3>
            <router-link to="/transactions" class="link-accent">Ver todas &rarr;</router-link>
          </div>
          <div v-if="recentTransactions.length" class="tx-list">
            <div v-for="t in recentTransactions" :key="t.id" class="tx-row">
              <div class="tx-dot" :class="t.type === 'ENTRADA' ? 'up' : 'down'"></div>
              <div class="tx-body">
                <span class="tx-desc">{{ t.description }}</span>
                <span class="tx-meta">{{ t.accountBankName }} · {{ fmtDate(t.date) }}</span>
              </div>
              <span class="tx-amt" :class="t.type === 'ENTRADA' ? 'up' : 'down'">
                {{ t.type === 'ENTRADA' ? '+' : '-' }}{{ fmt(t.amount) }}
              </span>
            </div>
          </div>
          <p v-else class="empty-msg">Nenhuma transação</p>
        </div>

        <div class="tile tile-list">
          <div class="tile-head">
            <h3>Contas</h3>
            <router-link to="/accounts" class="link-accent">Ver todas &rarr;</router-link>
          </div>
          <div v-if="limitedAccounts.length" class="tx-list">
            <div v-for="a in limitedAccounts" :key="a.id" class="tx-row">
              <div class="acc-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div class="tx-body">
                <span class="tx-desc">{{ a.bankName }}</span>
                <span class="tx-meta">{{ a.accountType }}</span>
              </div>
              <span class="tx-amt" :class="Number(a.balance) >= 0 ? 'up' : 'down'">{{ fmt(a.balance) }}</span>
            </div>
          </div>
          <p v-else class="empty-msg">Nenhuma conta</p>
        </div>
      </div>

      <!-- Doughnut -->
      <div class="tile tile-donut">
        <div class="tile-head">
          <h3>Categorias</h3>
        </div>
        <div class="chart-wrap donut-wrap">
          <Doughnut v-if="Object.keys(categoryBreakdown).length" :data="categoryChartData" :options="doughnutOptions" />
          <p v-else class="empty-chart">Sem despesas</p>
        </div>
      </div>
    </div>
  </div>
</template>
