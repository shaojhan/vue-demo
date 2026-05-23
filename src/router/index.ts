import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  // ---- Public / auth pages (no AppShell) ----
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: '首頁' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/LoginPage.vue'),
    meta: { title: '會員登入' }
  },
  {
    path: '/sso',
    name: 'SsoLogin',
    component: () => import('@/views/SsoLoginPage.vue'),
    meta: { title: 'SSO 登入' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { title: '會員註冊' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordPage.vue'),
    meta: { title: '忘記密碼' }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordPage.vue'),
    meta: { title: '重設密碼' }
  },
  {
    path: '/auth/callback',
    name: 'OAuthCallback',
    component: () => import('@/views/OAuthCallbackPage.vue'),
    meta: { title: '登入中' }
  },

  // ---- Authenticated app (wrapped in AppShell layout) ----
  {
    path: '/_app',
    component: () => import('@/components/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardPage.vue'),
        meta: { title: '儀表板' }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/views/UserPage.vue'),
        meta: { title: '個人資訊' }
      },
      {
        path: '/change-password',
        name: 'ChangePassword',
        component: () => import('@/views/ChangePasswordPage.vue'),
        meta: { title: '修改密碼' }
      },
      {
        path: '/login-records',
        name: 'LoginRecords',
        component: () => import('@/views/LoginRecordsPage.vue'),
        meta: { title: '登入紀錄' }
      },
      {
        path: '/messages',
        name: 'Messages',
        component: () => import('@/views/MessagesPage.vue'),
        meta: { title: '訊息中心' }
      },
      {
        path: '/chat',
        name: 'Chat',
        component: () => import('@/views/ChatPage.vue'),
        meta: { title: 'AI 助理', requiresEmployee: true }
      },
      {
        path: '/schedules',
        name: 'Schedules',
        component: () => import('@/views/SchedulePage.vue'),
        meta: { title: '排程管理', requiresEmployee: true }
      },
      {
        path: '/approvals',
        name: 'Approvals',
        component: () => import('@/views/ApprovalPage.vue'),
        meta: { title: '簽核管理', requiresEmployee: true }
      },
      {
        path: '/hr-chat',
        name: 'HrChat',
        component: () => import('@/views/HrChatPage.vue'),
        meta: { title: 'HR 審核助理', requiresEmployee: true }
      },
      {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/views/AdminPage.vue'),
        meta: { title: '管理後台', requiresAdmin: true }
      },
      {
        path: '/admin/calendar/select',
        name: 'GoogleCalendarSelect',
        component: () => import('@/views/GoogleCalendarSelectPage.vue'),
        meta: { title: '選擇 Google Calendar', requiresAdmin: true }
      },
      {
        path: '/mqtt',
        name: 'Mqtt',
        component: () => import('@/views/MqttPage.vue'),
        meta: { title: 'MQTT 管理', requiresAdmin: true }
      },
      {
        path: '/kafka',
        name: 'Kafka',
        component: () => import('@/views/KafkaPage.vue'),
        meta: { title: 'Kafka 管理', requiresAdmin: true }
      }
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: '頁面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '頁面'} | MES 平台`

  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()

    // Token 過期處理
    if (authStore.isExpired) {
      authStore.logout()
      next({ path: '/login', query: { expired: '1' } })
      return
    }

    if (!authStore.isLoggedIn) {
      next('/login')
      return
    }

    if (to.meta.requiresAdmin && authStore.user?.role !== 'ADMIN') {
      next('/')
      return
    }

    // 員工權限檢查（員工和管理員都可存取）
    if (to.meta.requiresEmployee) {
      const allowedRoles = ['EMPLOYEE', 'ADMIN']
      if (!allowedRoles.includes(authStore.user?.role || '')) {
        next('/user')
        return
      }
    }
  }

  next()
})

export default router
