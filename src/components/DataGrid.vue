<script setup lang="ts">
import { computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useThemeStore } from '@/stores/theme'

defineProps<{
  rowData: any[]
  columnDefs: ColDef[]
  defaultColDef?: ColDef
  clickable?: boolean
}>()

defineEmits<{
  'row-clicked': [event: RowClickedEvent]
}>()

const themeStore = useThemeStore()
// Quartz ships a light and a dark variant; pick by app theme so the grid's
// baked-in surface/border defaults match, then tokens refine the rest.
const themeClass = computed(() =>
  themeStore.mode === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'
)

const baseDefaultColDef: ColDef = {
  sortable: true,
  resizable: true
}
</script>

<template>
  <ag-grid-vue
    class="data-grid"
    :class="[themeClass, { clickable }]"
    :rowData="rowData"
    :columnDefs="columnDefs"
    :defaultColDef="defaultColDef || baseDefaultColDef"
    :pagination="false"
    :domLayout="'autoHeight'"
    @row-clicked="$emit('row-clicked', $event)"
  />
</template>

<style scoped>
/* Map ag-grid Quartz theme to the MES design tokens (Data-Dense Dashboard).
   Works for both light and dark variants since the tokens flip with data-theme. */
.data-grid {
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;

  --ag-font-family: var(--font-sans);
  --ag-font-size: var(--text-sm);
  --ag-foreground-color: var(--color-foreground);
  --ag-background-color: var(--color-surface);
  --ag-header-background-color: var(--color-muted);
  --ag-header-foreground-color: var(--color-foreground);
  --ag-header-column-resize-handle-color: var(--color-border-strong);
  --ag-border-color: var(--color-border);
  --ag-row-border-color: var(--color-border);
  --ag-row-hover-color: var(--color-muted);
  --ag-selected-row-background-color: var(--color-border);
  --ag-odd-row-background-color: var(--color-surface);
  --ag-control-panel-background-color: var(--color-surface);
  --ag-borders: solid 1px;
  --ag-border-radius: var(--radius-md);

  /* Dense layout: tighter rows + headers for maximum data visibility */
  --ag-grid-size: 5px;
  --ag-row-height: 38px;
  --ag-header-height: 40px;
  --ag-cell-horizontal-padding: var(--space-3);
}

/* Tabular figures so numeric columns stay aligned */
.data-grid :deep(.ag-cell) {
  font-variant-numeric: tabular-nums;
}

.data-grid :deep(.ag-header-cell-text) {
  font-weight: var(--weight-semibold);
}

.data-grid.clickable :deep(.ag-row) {
  cursor: pointer;
}
</style>
