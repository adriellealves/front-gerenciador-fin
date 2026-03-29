import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      // Se a pessoa já estiver logada, não faz sentido ela ver a tela de login
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
      component: DashboardView,
      meta: { requiresAuth: true } // 👈 Etiqueta de Rota Protegida
    },
    {
      path: '/accounts',
      name: 'Accounts',
      component: () => import('../views/AccountsView.vue'),
      meta: { requiresAuth: true } // 👈 Etiqueta de Rota Protegida
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/CategoriesView.vue'),
      meta: { requiresAuth: true } // 👈 Etiqueta de Rota Protegida
    }
  ]
})

// O GUARDA-COSTAS: Executa ANTES de cada mudança de tela
router.beforeEach((to, _from, next) => {
  // 1. Verifica se o usuário tem a chave no cofre
  const isAuthenticated = localStorage.getItem('@CoreFinancas:token')

  // 2. Se a rota exige autenticação e o usuário NÃO tem a chave
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    // Chuta para o login!
    next('/login')
  } 
  // 3. Se a rota é só para visitantes (ex: Tela de Login) e o usuário JÁ ESTÁ logado
  else if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
    // Manda direto pro Dashboard!
    next('/')
  } 
  // 4. Se estiver tudo certo, deixa passar
  else {
    next()
  }
})

export default router