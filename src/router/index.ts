import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      title: '首頁'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/LoginPage.vue'),
    meta: {
      title: '會員登入'
    }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/UserPage.vue'),
    meta: {
      title: '個人資訊',
      requiresAuth: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: {
      title: '會員註冊'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordPage.vue'),
    meta: {
      title: '忘記密碼'
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordPage.vue'),
    meta: {
      title: '重設密碼'
    }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePasswordPage.vue'),
    meta: {
      title: '修改密碼',
      requiresAuth: true
    }
  },
  {
    path: '/auth/callback',
    name: 'OAuthCallback',
    component: () => import('@/views/OAuthCallbackPage.vue'),
    meta: {
      title: '登入中'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: {
      title: '管理後台',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: {
      title: '頁面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '頁面'} | Vue Demo`

  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      next('/login')
      return
    }

    if (to.meta.requiresAdmin && authStore.user?.role !== 'ADMIN') {
      next('/')
      return
    }
  }

  next()
})

export default router
