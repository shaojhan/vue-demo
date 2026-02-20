<script setup lang="ts">
import { NPagination } from 'naive-ui'

defineProps<{
  page: number
  pageSize: number
  itemCount: number
}>()

defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <div v-if="itemCount > pageSize" class="pagination-wrapper">
    <NPagination
      :page="page"
      :page-size="pageSize"
      :item-count="itemCount"
      @update:page="$emit('update:page', $event)"
    />
  </div>
</template>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
}
</style>
