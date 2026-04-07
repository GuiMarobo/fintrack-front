<script setup>
defineProps({
  label: { type: String, default: '' }
})
</script>

<template>
  <div class="form-group">
    <label v-if="label">{{ label }}</label>
    <slot />
  </div>
</template>
