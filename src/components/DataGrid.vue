<script setup lang="ts">
import { computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { themeQuartz, colorSchemeDark, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import { useThemeStore } from '@/stores/theme'

// 註冊 ag-grid module。放在此唯一使用 grid 的元件，使 ag-grid 隨 lazy view code-split，
// 不進入主 bundle。模組頂層程式碼在首次 import 時執行一次，等同單次註冊。
//
// 只註冊實際用到的功能：ClientSideRowModelModule 已含排序(Sort)；欄寬調整、cellRenderer、
// valueFormatter/valueGetter、domLayout autoHeight 皆為核心功能，無需額外 module。
// ValidationModule 僅 dev 載入（會印出缺漏 module 的明確提示），production build 自動排除。
ModuleRegistry.registerModules([ClientSideRowModelModule])
if (import.meta.env.DEV) {
  import('ag-grid-community').then(({ ValidationModule }) => {
    ModuleRegistry.registerModules([ValidationModule])
  })
}

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

/**
 * ag-grid v33+ uses the Theming API (JS theme objects), which overrides the
 * legacy CSS-class themes — so the grid must be themed here, not via CSS.
 * Params mirror the MES design tokens for light and dark (Data-Dense Dashboard).
 */
const baseParams = {
  fontFamily: "'Fira Sans', system-ui, -apple-system, sans-serif",
  fontSize: 14,
  rowHeight: 38,
  headerHeight: 40,
  spacing: 6,
  borderRadius: 8,
  wrapperBorderRadius: 8,
  headerFontWeight: 600
}

const lightTheme = themeQuartz.withParams({
  ...baseParams,
  backgroundColor: '#ffffff',
  foregroundColor: '#0f172a',
  headerBackgroundColor: '#e9eef6',
  headerTextColor: '#0f172a',
  borderColor: '#dbeafe',
  rowHoverColor: '#f1f5f9',
  oddRowBackgroundColor: '#ffffff'
})

const darkTheme = themeQuartz.withPart(colorSchemeDark).withParams({
  ...baseParams,
  backgroundColor: '#111a2e',
  foregroundColor: '#e2e8f0',
  headerBackgroundColor: '#1c2840',
  headerTextColor: '#e2e8f0',
  borderColor: '#1e293b',
  rowHoverColor: '#16213a',
  oddRowBackgroundColor: '#111a2e'
})

const gridTheme = computed(() => (themeStore.mode === 'dark' ? darkTheme : lightTheme))

const baseDefaultColDef: ColDef = {
  sortable: true,
  resizable: true
}
</script>

<template>
  <ag-grid-vue
    class="data-grid"
    :class="{ clickable }"
    :theme="gridTheme"
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
}

/* Tabular figures so numeric columns stay aligned */
.data-grid :deep(.ag-cell) {
  font-variant-numeric: tabular-nums;
}

.data-grid.clickable :deep(.ag-row) {
  cursor: pointer;
}
</style>
