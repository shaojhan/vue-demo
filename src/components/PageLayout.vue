<script setup lang="ts">
/**
 * Page content container. Navigation chrome (sidebar + topbar) is now provided
 * by AppShell at the route layout level, so this component only constrains and
 * holds page content. `maxWidth` lets form-oriented pages stay narrow; data-dense
 * pages omit it to use the full content width.
 *
 * `badge` and the `#nav` slot are retained for backward compatibility but no
 * longer rendered (the sidebar/topbar replaces them) — cleaned up per page in
 * later phases.
 */
defineProps<{
  badge?: string
  maxWidth?: string
}>()
</script>

<template>
  <div class="page-layout" :style="maxWidth ? { maxWidth } : undefined">
    <slot />
  </div>
</template>

<style scoped>
.page-layout {
  width: 100%;
  margin: 0 auto;
}
</style>
