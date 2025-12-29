<template>
  <div class="home-page">
    <header class="home-header">
      <h1 class="page-title">单词记忆大师</h1>
    </header>

    <main class="main-content">
      <section class="category-card common-card">
        <div class="category-info">
          <div class="left">
            <span class="label">当前词库</span>
            <div class="value">{{ currentCategoryLabel }}</div>
            <div class="hint">可在“我的”页面切换词库</div>
          </div>
          <div class="pill">Ready</div>
        </div>
      </section>

      <section class="function-section">
        <div class="function-row">
          <button class="function-btn learn-btn" @click="$router.push('/learn')">Learn</button>
          <button class="function-btn review-btn" 
            @click="$router.push({ path: '/review', query: { level: currentLevel } })">
      Review
    </button>
          <button class="function-btn spell-btn" @click="$router.push('/spelling')">Spell</button>
        </div>
      </section>

      <bottom-nav />
    </main>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useLearnStore } from '@/store/learn'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Home',
  components: { BottomNav },
  computed: {
    ...mapState(useLearnStore, ['currentLevel']),
    currentCategoryLabel() {
      if (this.currentLevel === 'CET4') return 'CET-4'
      if (this.currentLevel === 'CET6') return 'CET-6'
      if (this.currentLevel === 'KaoYan') return '考研词汇'
      return this.currentLevel
    }
  },
  async created() {
    const store = useLearnStore()
    await store.hydrate()      // ① 先拿到当前用户
    
    await store.fetchWords()   // ② 再拉该用户数据
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding: 9rem 1rem 3.2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}
.home-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.2rem 1rem;
  position: relative;
  .page-title {
    font-size: clamp(1.4rem, 2vw + 1rem, 2.2rem);
    font-weight: 800;
    letter-spacing: 0.1rem;
    color: #333;
    text-shadow: 0 2px 4px rgba(0, 0, 0, .1);
  }
}
.main-content {
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1rem;
}
.category-card {
  @include card;
  padding: 1.4rem 1.2rem;
  background: linear-gradient(120deg, rgba(111, 168, 255, 0.15), rgba(255, 255, 255, 0.9));
}
.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-base);
  .left {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .label { color: #666; font-weight: 600; }
  .value { font-weight: 800; color: #1f2937; font-size: 1.2rem; }
  .hint { font-size: var(--text-sm); color: #7a869a; }
  .pill {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    background: rgba(79, 139, 255, 0.15);
    color: #4f8bff;
    font-weight: 700;
    font-size: var(--text-sm);
  }
}
.function-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.function-row {
  display: flex;
  gap: 0.8rem;
}
.function-btn {
  flex: 1;
  @include btn;
  padding: 1.2rem 0;
  font-size: var(--text-lg);
  font-weight: 700;
  border: none;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  &:active { transform: translateY(1px); }
}
</style>