<script setup lang="ts">
import { computed, h, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
  NIcon,
  NDropdown,
  NAvatar,
  type MenuOption
} from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/composables/useLogout'
import { icons } from '@/theme/icons'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { logout } = useLogout()

const collapsed = ref(false)
const isMobile = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) collapsed.value = true
}
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => window.removeEventListener('resize', handleResize))

const role = computed(() => authStore.user?.role ?? '')
const isAdmin = computed(() => role.value === 'ADMIN')
const isEmployee = computed(() => role.value === 'EMPLOYEE' || isAdmin.value)

const renderIcon = (name: keyof typeof icons) => () => h(NIcon, null, { default: icons[name] })

/** Sidebar module groups. `show` gates by role. */
const menuOptions = computed<MenuOption[]>(() => {
  const groups: Array<{
    label: string
    key: string
    show: boolean
    items: Array<{ label: string; key: string; icon: keyof typeof icons; show: boolean }>
  }> = [
    {
      label: '總覽',
      key: 'g-overview',
      show: true,
      items: [{ label: '儀表板', key: '/dashboard', icon: 'dashboard', show: true }]
    },
    {
      label: '整合管理',
      key: 'g-integration',
      show: isAdmin.value,
      items: [
        { label: 'Kafka', key: '/kafka', icon: 'integration', show: isAdmin.value },
        { label: 'MQTT', key: '/mqtt', icon: 'integration', show: isAdmin.value }
      ]
    },
    {
      label: '營運',
      key: 'g-ops',
      show: true,
      items: [
        { label: '簽核管理', key: '/approvals', icon: 'operations', show: isEmployee.value },
        { label: '排程管理', key: '/schedules', icon: 'schedule', show: isEmployee.value },
        { label: '訊息中心', key: '/messages', icon: 'messages', show: true }
      ]
    },
    {
      label: '智能助理',
      key: 'g-ai',
      show: isEmployee.value,
      items: [
        { label: 'AI 助理', key: '/chat', icon: 'assistant', show: isEmployee.value },
        { label: 'HR 審核助理', key: '/hr-chat', icon: 'assistant', show: isEmployee.value }
      ]
    },
    {
      label: '系統管理',
      key: 'g-admin',
      show: isAdmin.value,
      items: [
        { label: '管理後台', key: '/admin', icon: 'admin', show: isAdmin.value },
        { label: '登入紀錄', key: '/login-records', icon: 'records', show: isAdmin.value }
      ]
    }
  ]

  return groups
    .filter((g) => g.show)
    .map((g) => ({
      type: 'group',
      label: g.label,
      key: g.key,
      children: g.items
        .filter((it) => it.show)
        .map((it) => ({ label: it.label, key: it.key, icon: renderIcon(it.icon) }))
    }))
    .filter((g) => (g.children as MenuOption[]).length > 0)
})

const activeKey = computed(() => route.path)
const handleMenuSelect = (key: string) => {
  if (key !== route.path) router.push(key)
}

const pageTitle = computed(() => (route.meta.title as string) || '')

const userOptions = computed(() => [
  { label: '個人資訊', key: 'profile', icon: renderIcon('user') },
  { label: '修改密碼', key: 'password', icon: renderIcon('key') },
  { type: 'divider', key: 'd1' },
  { label: '登出', key: 'logout', icon: renderIcon('logout') }
])
const handleUserAction = (key: string) => {
  if (key === 'profile') router.push('/user')
  else if (key === 'password') router.push('/change-password')
  else if (key === 'logout') logout()
}

const userLabel = computed(() => authStore.user?.uid || authStore.user?.email || '使用者')
const roleLabel = computed(() =>
  role.value === 'ADMIN' ? '管理員' : role.value === 'EMPLOYEE' ? '員工' : '一般用戶'
)
</script>

<template>
  <NLayout has-sider class="app-shell">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      class="app-sider"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="brand" :class="{ collapsed }">
        <svg viewBox="0 0 48 48" fill="none" class="brand-logo">
          <rect width="48" height="48" rx="12" fill="var(--color-primary)" />
          <path
            d="M24 14L14 20V32L24 38L34 32V20L24 14Z"
            stroke="white"
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <path
            d="M24 26L14 20M24 26V38M24 26L34 20"
            stroke="white"
            stroke-width="2.5"
            stroke-linejoin="round"
          />
        </svg>
        <span v-if="!collapsed" class="brand-name">MES 平台</span>
      </div>

      <NMenu
        :value="activeKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="20"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </NLayoutSider>

    <NLayout class="app-main">
      <NLayoutHeader bordered class="topbar">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="topbar-actions">
          <NDropdown
            trigger="click"
            :options="userOptions"
            @select="handleUserAction"
          >
            <NButton text class="user-trigger">
              <NAvatar round size="small" class="user-avatar">
                {{ userLabel.charAt(0).toUpperCase() }}
              </NAvatar>
              <span class="user-meta">
                <span class="user-name">{{ userLabel }}</span>
                <span class="user-role">{{ roleLabel }}</span>
              </span>
            </NButton>
          </NDropdown>
        </div>
      </NLayoutHeader>

      <NLayoutContent class="content" :native-scrollbar="false">
        <div class="content-inner">
          <RouterView />
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.app-shell {
  height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: var(--topbar-height);
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.brand.collapsed {
  justify-content: center;
  padding: 0;
}

.brand-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.brand-name {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--color-foreground);
  white-space: nowrap;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 var(--space-5);
  background: var(--color-surface);
}

.page-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-foreground);
  margin: 0;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.user-avatar {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: var(--weight-semibold);
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-foreground);
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-foreground-muted);
}

.content {
  background: var(--color-background);
}

.content-inner {
  padding: var(--space-5);
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .user-meta {
    display: none;
  }

  .content-inner {
    padding: var(--space-4);
  }
}
</style>
