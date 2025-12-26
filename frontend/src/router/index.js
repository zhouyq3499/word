import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue') },
  { path: '/home', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/learn', name: 'Learn', component: () => import('@/views/Learn.vue') },
  { path: '/review', name: 'Review', component: () => import('@/views/Review.vue') },
  { path: '/spelling', name: 'Spelling', component: () => import('@/views/Spelling.vue') },
  { path: '/word-book', name: 'WordBook', component: () => import('@/views/WordBook.vue') },
  // ===== 新增：我的 =====
  { path: '/user', name: 'User', component: () => import('@/views/User.vue') }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
