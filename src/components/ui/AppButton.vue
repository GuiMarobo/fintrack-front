<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' }
})
</script>

<template>
  <button
    :type="type"
    :class="[`btn-${variant}`, { 'btn-primary--block': block }]"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else />
  </button>
</template>
