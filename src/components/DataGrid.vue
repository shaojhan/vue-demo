<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

defineProps<{
  rowData: any[]
  columnDefs: ColDef[]
  defaultColDef?: ColDef
  clickable?: boolean
}>()

defineEmits<{
  'row-clicked': [event: RowClickedEvent]
}>()

const baseDefaultColDef: ColDef = {
  sortable: true,
  resizable: true
}
</script>

<template>
  <ag-grid-vue
    class="ag-theme-quartz data-grid"
    :class="{ clickable }"
    :rowData="rowData"
    :columnDefs="columnDefs"
    :defaultColDef="defaultColDef || baseDefaultColDef"
    :pagination="false"
    :domLayout="'autoHeight'"
    @row-clicked="$emit('row-clicked', $event)"
  />
</template>

<style scoped>
.data-grid {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.data-grid.clickable :deep(.ag-row) {
  cursor: pointer;
}
</style>
