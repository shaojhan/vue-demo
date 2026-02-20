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
  color: #94a3b8;
  font-size: 15px;
}

.empty-state p {
  margin: 0;
}
</style>
