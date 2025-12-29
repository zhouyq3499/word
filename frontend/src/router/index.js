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
  const whiteList = ['/login', '/register']
  const userId = localStorage.getItem('userId')

  // 更严谨的判断：空字符串、undefined、null 都视为未登录
  const isLoggedIn = !!userId

  if (whiteList.includes(to.path)) {
    // 已登录时访问登录页，自动跳首页
    if (isLoggedIn && to.path === '/login') {
      return next('/home')
    }
    return next()
  }

  if (!isLoggedIn) {
    return next('/login')
  }

  next()
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})
export default router


