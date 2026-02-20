<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="form-group">
    <label>{{ label }}</label>
    <slot />
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}
</style>
