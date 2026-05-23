import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

/**
 * App color-scheme store. Drives both the CSS-token theme (via the
 * `data-theme` attribute on <html>) and naive-ui's theme (consumed in App.vue).
 * Persisted so the user's choice survives reloads.
 */
export const useThemeStore = defineStore(
  'theme',
  () => {
    const mode = ref<ThemeMode>('light')

    const apply = (value: ThemeMode) => {
      document.documentElement.dataset.theme = value
    }

    const setMode = (value: ThemeMode) => {
      mode.value = value
    }

    const toggle = () => {
      mode.value = mode.value === 'light' ? 'dark' : 'light'
    }

    // Keep the <html data-theme> attribute in sync (immediate covers restore).
    watch(mode, apply, { immediate: true })

    return { mode, setMode, toggle }
  },
  { persist: true }
)
