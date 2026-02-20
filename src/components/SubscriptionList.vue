<script setup lang="ts">
import { NButton } from 'naive-ui'

defineProps<{
  topics: string[]
  emptyMessage?: string
}>()

defineEmits<{
  unsubscribe: [topic: string]
}>()
</script>

<template>
  <div v-if="topics.length > 0" class="subscription-list">
    <div v-for="topic in topics" :key="topic" class="subscription-item">
      <code class="topic-name">{{ topic }}</code>
      <NButton size="tiny" type="error" secondary @click="$emit('unsubscribe', topic)">取消訂閱</NButton>
    </div>
  </div>
  <div v-else class="empty-hint">{{ emptyMessage || '目前沒有訂閱任何主題' }}</div>
</template>

<style scoped>
.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.subscription-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.topic-name {
  font-family: monospace;
  font-size: 14px;
  color: #1e293b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.empty-hint {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 14px;
}
</style>
