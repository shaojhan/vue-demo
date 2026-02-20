<script setup lang="ts">
import { NModal, NAlert, NButton, NSpace } from 'naive-ui'

defineProps<{
  show: boolean
  title: string
  maxWidth?: string
  error?: string
  submitLabel?: string
  submitLoading?: boolean
}>()

defineEmits<{
  'update:show': [value: boolean]
  submit: []
  cancel: []
}>()
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="title"
    :style="{ maxWidth: maxWidth || '520px' }"
    :mask-closable="true"
    @update:show="$emit('update:show', $event)"
  >
    <NAlert v-if="error" type="error" :bordered="false" style="margin-bottom: 16px;">
      {{ error }}
    </NAlert>

    <slot />

    <template #footer>
      <NSpace justify="end">
        <NButton @click="$emit('cancel')">取消</NButton>
        <NButton type="success" :loading="submitLoading" @click="$emit('submit')">
          {{ submitLabel || '儲存' }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
