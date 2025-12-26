<template>
  <div class="home-page">
    <header class="home-header">
      <h1 class="page-title">单词记忆大师</h1>
      <button class="logout-header-btn" @click="logout">退出登录</button>
    </header>

    <main class="main-content">
      <section class="category-card common-card">
        <div class="category-buttons">
          <button
            v-for="c in categories"
            :key="c.value"
            :class="{ active: currentCategory === c.value }"
            @click="setCategory(c.value)"
          >
            {{ c.label }}
          </button>
        </div>
      </section>

      <section class="function-section">
        <div class="function-row">
          <button class="function-btn learn-btn" @click="$router.push('/learn')">Learn</button>
          <button class="function-btn review-btn" @click="$router.push('/review')">Review</button>
          <button class="function-btn spell-btn" @click="$router.push('/spelling')">Spell</button>
        </div>
      </section>

      <bottom-nav />
    </main>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useLearnStore } from '@/store/learn'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Home',
  components: { BottomNav },
  computed: {
    ...mapState(useLearnStore, { currentCategory: 'currentLevel' })
  },
  data () {
    return {
      categories: [
        { label: '四级', value: 'CET4' },
        { label: '六级', value: 'CET6' },
        { label: '考研', value: 'POSTGRADUATE' }
      ]
    }
  },
  created () {
    this.hydrate()
    this.fetchWords(this.currentCategory)
  },
  methods: {
    ...mapActions(useLearnStore, ['changeLevel', 'fetchWords', 'hydrate']),
    setCategory (cat) { this.changeLevel(cat) },
    logout () { this.$router.replace('/login') }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding-bottom: 3.2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* ---------- 头部 ---------- */
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
    text-shadow: 0 2px 4px rgba(0,0,0,.1);
  }
  /* 退出登录按钮放在原图标位置 */
  .logout-header-btn {
    position: absolute;
    right: 1rem;
    padding: 0.4rem 0.8rem;
    font-size: var(--text-sm);
    border-radius: var(--radius);
    background: var(--glass);
    color: #666;
    border: none;
    cursor: pointer;
    @include btn;
  }
}

/* ---------- 内容区 ---------- */
.main-content {
  flex: 1;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* 分类卡片 */
.category-card {
  @include card;
  padding: 1.2rem;
}
.category-buttons {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  button {
    padding: 0.5rem 1.2rem;
    border-radius: var(--radius);
    font-size: var(--text-base);
    background: rgba(225,240,255,.7);
    color: #555;
    border: none;
    transition: all .3s;
    cursor: pointer;
    &.active {
      background: var(--primary);
      color: #fff;
      transform: scale(1.05);
    }
  }
}

/* 功能按钮区 */
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
}
</style>
