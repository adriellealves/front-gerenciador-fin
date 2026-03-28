import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Definimos as rotas com tipagem forte
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue') // Lazy loading: carrega só quando precisar!
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import('../views/AccountsView.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/CategoriesView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router