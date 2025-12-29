<template>
  <div class="word-book-page">
    <div class="page-content">
      <h1 class="page-title">我的单词本</h1>

      <div class="empty-state common-card" v-if="userWordBook.length === 0">
        <div class="empty-icon">🔖</div>
        <p class="empty-text">单词本还是空的哦~</p>
        <p class="empty-subtext">在学习中标记"不认识"的单词会在这里显示</p>
        <button class="start-learn-btn" @click="$router.push('/learn')">开始学习</button>
      </div>

      <div v-else>
        <div class="word-count common-card">共 {{ userWordBook.length }} 个单词</div>
        <div class="word-cards">
          <word-card
            v-for="(word, index) in userWordBook"
            :key="index"
            :word="word"
            :show-delete="true"
            @delete-word="remove"
          />
        </div>
      </div>
    </div>

    <bottom-nav />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useLearnStore } from '@/store/learn'
import WordCard from '@/components/WordCard.vue'
import BottomNav from '@/components/BottomNav.vue'
import { getWordBook, removeFromWordBook } from '@/api/learn'

export default {
  name: 'WordBook',
  components: { WordCard, BottomNav },
  data() {
    return {
      wordBook: []
    }
  },
  computed: {
    ...mapState(useLearnStore, ['currentUser']),
    userWordBook() {
      return this.wordBook
    }
  },
  async mounted() {
    const userId = localStorage.getItem('userId')
    if (userId) {
      this.wordBook = await getWordBook(userId)
    } else {
      this.$router.replace('/login')
    }
  },
  methods: {
    async remove(word) {
      const userId = localStorage.getItem('userId')
      if (!userId) return
      await removeFromWordBook(userId, word.id)
      this.wordBook = this.wordBook.filter(w => w.id !== word.id)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.word-book-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding-bottom: 3.5rem;
  box-sizing: border-box;
}

.page-content {
  width: 100%;
  max-width: 53rem;
  margin: 0 auto;
  padding: var(--space);
}

.page-title {
  text-align: center;
  font-size: var(--text-xl);
  font-weight: 800;
  margin-bottom: var(--space-lg);
  color: #333;
}

.empty-state {
  text-align: center;
  padding: var(--space-xl);
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
}

.empty-text {
  font-size: var(--text-lg);
  font-weight: 600;
  color: #555;
  margin-bottom: var(--space-xs);
}

.empty-subtext {
  font-size: var(--text-base);
  color: #666;
  margin-bottom: var(--space);
}

.start-learn-btn {
  @include btn;
  width: 14rem;
  height: 2.4rem;
  border-radius: var(--radius);
  font-size: var(--text-base);
}

.word-count {
  text-align: center;
  padding: var(--space-lg);
  font-size: var(--text-base);
  font-weight: 600;
  color: #555;
  margin-bottom: var(--space-lg);
  @include card;
}

.word-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>