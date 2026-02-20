<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NSpace } from 'naive-ui'
import { useLogout } from '@/composables/useLogout'

defineProps<{
  badge?: string
}>()

const router = useRouter()
const { logout: handleLogout } = useLogout()
</script>

<template>
  <nav class="top-nav">
    <div class="nav-brand">
      <svg viewBox="0 0 48 48" fill="none" class="nav-logo">
        <rect width="48" height="48" rx="12" fill="url(#grad)"/>
        <path d="M24 14L14 20V32L24 38L34 32V20L24 14Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M24 26L14 20M24 26V38M24 26L34 20" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
            <stop stop-color="#6366f1"/>
            <stop offset="1" stop-color="#8b5cf6"/>
          </linearGradient>
        </defs>
      </svg>
      <span>Vue Demo</span>
      <span v-if="badge" class="nav-badge">{{ badge }}</span>
    </div>
    <NSpace>
      <slot />
      <NButton @click="router.push('/user')">個人頁面</NButton>
      <NButton @click="handleLogout">登出</NButton>
    </NSpace>
  </nav>
</template>

<style scoped>
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.nav-logo {
  width: 36px;
  height: 36px;
}

.nav-badge {
  padding: 4px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .top-nav {
    padding: 12px 16px;
  }
}
</style>
