import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: {
      title: '首頁'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginPage.vue'),
    meta: {
      title: '會員登入'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
    meta: {
      title: '會員註冊'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue'),
    meta: {
      title: '頁面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛 - 設定頁面標題
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '頁面'} | Vue Demo`
  next()
})

export default router
