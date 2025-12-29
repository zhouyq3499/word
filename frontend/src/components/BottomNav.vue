<template>
  <div class="bottom-nav">
    <router-link
      v-for="item in navList"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: $route.path === item.path }"
    >
      <i :class="item.icon"></i>
      <span>{{ item.title }}</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'BottomNav',
  data () {
    return {
      navList: [
      { path: '/home',   title: '首页',   icon: 'el-icon-house' },
      { path: '/word-book', title: '单词本', icon: 'el-icon-notebook-2' },
      { path: '/ai-chat', title: 'AI 解答', icon: 'el-icon-chat-dot-square' }, // ★新增
      { path: '/user', title: '我的',   icon: 'el-icon-user' }
    ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4.4rem;              // 稍高
  background: var(--glass);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,.3);
  z-index: 999;

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1.5rem;        // ★ 字号加大
    color: #666;
    text-decoration: none;
    transition: color .2s;
    i{font-size: 1.7rem; margin-bottom: 0.5rem;}  // 图标同步放大
    &.active{
      color: var(--primary);
    }
  }
}
</style>