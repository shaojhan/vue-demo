<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="page-header" :class="{ 'has-action': $slots.default }">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 36px;
}

.page-header.has-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.page-header p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

@media (max-width: 640px) {
  .page-header.has-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }
}
</style>
