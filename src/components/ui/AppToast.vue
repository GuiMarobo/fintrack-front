<script setup>
defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'success' }
})
</script>

<template>
  <Transition name="toast">
    <p v-if="message" :class="['toast', type]">
      <svg v-if="type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      {{ message }}
    </p>
  </Transition>
</template>
