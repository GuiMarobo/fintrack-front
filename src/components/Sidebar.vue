<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/accounts', label: 'Contas', icon: 'accounts' },
  { path: '/transactions', label: 'Transações', icon: 'transactions' },
  { path: '/profile', label: 'Perfil', icon: 'profile' }
]

const currentPath = computed(() => route.path)

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <router-link to="/" class="topbar-brand">
        <div class="brand-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="brand-text">Fintrack</span>
      </router-link>

      <div class="nav-divider"></div>

      <nav class="topbar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: currentPath === item.path }"
        >
          <svg v-if="item.icon === 'dashboard'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
          <svg v-else-if="item.icon === 'accounts'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <svg v-else-if="item.icon === 'transactions'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
          <svg v-else-if="item.icon === 'profile'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <button class="logout-btn" @click="handleLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Sair</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  width: 100%;
  height: var(--topbar-h);
  background: rgba(8, 8, 13, 0.8);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.topbar-inner {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 1.75rem;
  gap: 0;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  background: var(--accent);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  box-shadow: 0 0 16px var(--accent-glow), 0 0 4px rgba(206, 255, 0, 0.12);
  transition: box-shadow 0.3s;
}

.topbar-brand:hover .brand-mark {
  box-shadow: 0 0 24px rgba(206, 255, 0, 0.15), 0 0 6px rgba(206, 255, 0, 0.2);
}

.brand-text {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.4px;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 1.25rem;
  flex-shrink: 0;
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;
  letter-spacing: -0.1px;
}

.nav-link:hover {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
}

.nav-link.active {
  color: var(--bg-primary);
  background: var(--accent);
}

.nav-link.active svg {
  stroke: var(--bg-primary);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.15s;
  margin-left: auto;
}

.logout-btn:hover {
  background: rgba(255, 80, 80, 0.08);
  color: #f06;
}

.logout-btn:hover svg {
  stroke: #f06;
}

@media (max-width: 640px) {
  .nav-link span, .logout-btn span, .brand-text {
    display: none;
  }
  .nav-divider {
    margin: 0 0.5rem;
  }
  .topbar-inner {
    padding: 0 0.75rem;
  }
}
</style>
