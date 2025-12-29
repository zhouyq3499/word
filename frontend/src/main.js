import Vue from 'vue'
import VueRouter from 'vue-router'   // ← 1. 引入
import App from './App.vue'
import router from './router'
import pinia from './store'
import '@/styles/index.scss'

Vue.use(VueRouter)   // ← 2. 关键：注册路由插件
Vue.config.productionTip = false

new Vue({
  router,
  pinia,
  render: h => h(App)
}).$mount('#app')