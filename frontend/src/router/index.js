// src/router/index.js
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
  { path: '/ai-chat', name: 'AiChat', component: () => import('@/views/AiChat.vue') },
  { path: '/user', name: 'User', component: () => import('@/views/User.vue') }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

/* =============== 登录守卫 =============== */
router.beforeEach((to, from, next) => {
  const whiteList = ['/login', '/register']              // 无需登录即可访问
  const token = localStorage.getItem('userId')           // 登录后你存的是 userId
  if (whiteList.includes(to.path)) return next()         // 白名单直接放行
  if (!token) return next('/login')                      // 没登录 → 回登录页
  next()                                                 // 已登录 → 放行
})

export default router