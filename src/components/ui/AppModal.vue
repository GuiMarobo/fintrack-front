<script setup>
defineProps({
  show: { type: Boolean, required: true },
  maxWidth: { type: String, default: '440px' }
})
defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal" :style="{ maxWidth }">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
