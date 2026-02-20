<script setup lang="ts">
import TopNav from '@/components/TopNav.vue'

defineProps<{
  badge?: string
  maxWidth?: string
}>()
</script>

<template>
  <div class="page-layout">
    <TopNav :badge="badge">
      <slot name="nav" />
    </TopNav>

    <main class="page-layout-content" :style="maxWidth ? { maxWidth } : undefined">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: #f8fafc;
}

.page-layout-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
}

@media (max-width: 640px) {
  .page-layout-content {
    padding: 32px 16px;
  }
}
</style>
