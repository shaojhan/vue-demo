<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme } from 'naive-ui'
import { lightThemeOverrides, darkThemeOverrides } from '@/theme/naive-overrides'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.mode === 'dark')
const theme = computed(() => (isDark.value ? darkTheme : null))
const themeOverrides = computed(() => (isDark.value ? darkThemeOverrides : lightThemeOverrides))
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <NDialogProvider>
        <RouterView />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
