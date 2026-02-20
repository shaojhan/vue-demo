<script setup lang="ts">
import { NInput, NButton } from 'naive-ui'

defineProps<{
  modelValue: string
  placeholder?: string
  maxWidth?: string
  showButton?: boolean
  buttonLabel?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  search: []
}>()
</script>

<template>
  <div class="filter-bar">
    <NInput
      :value="modelValue"
      :placeholder="placeholder || '篩選...'"
      clearable
      :style="{ maxWidth: maxWidth || '300px' }"
      @update:value="$emit('update:modelValue', $event)"
      @clear="$emit('search')"
    />
    <NButton v-if="showButton" type="primary" @click="$emit('search')">
      {{ buttonLabel || '搜尋' }}
    </NButton>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
