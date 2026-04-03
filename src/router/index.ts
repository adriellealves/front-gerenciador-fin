import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/accounts',
      name: 'Accounts',
      component: () => import('../views/AccountsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/CategoriesView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('@CoreFinancas:token')

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login')
  } else if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router