<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()
const isAuthPage = computed(() => route.meta?.guest === true)
</script>

<template>
  <div v-if="isAuthPage">
    <router-view />
  </div>
  <div v-else class="app-layout">
    <Sidebar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
