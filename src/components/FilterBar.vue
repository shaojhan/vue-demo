<script setup lang="ts">
import { NInput, NButton, NIcon } from 'naive-ui'
import { h } from 'vue'

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

const searchIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    },
    [h('circle', { cx: 11, cy: 11, r: 8 }), h('path', { d: 'm21 21-4.3-4.3' })]
  )
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
      @keyup.enter="$emit('search')"
    >
      <template #prefix>
        <NIcon :component="searchIcon" />
      </template>
    </NInput>

    <!-- Extra filter controls (selects, date pickers, etc.) -->
    <slot name="filters" />

    <NButton v-if="showButton" type="primary" @click="$emit('search')">
      {{ buttonLabel || '搜尋' }}
    </NButton>

    <!-- Right-aligned page actions (e.g. "新增") -->
    <div v-if="$slots.actions" class="filter-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.filter-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
