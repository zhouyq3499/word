<template>
  <div class="user-page">
    <header class="user-header">
      <h2>我的</h2>
    </header>
    <div class="user-content">
      <p>开发中，敬请期待…</p>
    </div>
    <!-- 底部导航 -->
    <bottom-nav />
  </div>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
export default { name: 'User', components: { BottomNav } }
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
.user-page{
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding-bottom: 3.5rem;   // 给底部导航留空
  .user-header{
    text-align: center;
    padding: var(--space-lg);
    font-size: var(--text-xl);
    font-weight: 800;
    color: #333;
  }
  .user-content{
    text-align: center;
    padding: var(--space-xl);
    color: #666;
  }
}
</style>