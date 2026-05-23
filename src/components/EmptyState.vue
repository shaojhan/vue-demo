<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="empty-state">
    <p>{{ message || '無資料' }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--color-foreground-muted);
  font-size: 15px;
}

.empty-state p {
  margin: 0;
}
</style>
