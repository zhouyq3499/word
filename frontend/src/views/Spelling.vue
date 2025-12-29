<template>
  <div class="spelling-page">
    <header class="spelling-header">
      <button class="back-btn" @click="home">←</button>
      <h2 class="header-title">拼写测试</h2>
    </header>

    <div class="empty-state common-card" v-if="totalCount === 0">
      <div class="empty-icon">✍️</div>
      <p class="empty-text">暂无单词可拼写</p>
      <p class="empty-subtext">请先完成学习，单词会自动出现在这里</p>
      <button class="start-learn-btn" @click="$router.push('/learn')">去学习</button>
    </div>

    <div class="spelling-content" v-else-if="!isCompleted">
      <div class="word-meaning common-card">
        <span class="meaning-label">词义：</span>
        <div class="meaning-content">
          <div class="meaning-item">
            <span class="definition">{{ current.meaning }}</span>
          </div>
        </div>
      </div>

      <div class="input-area">
        <input class="common-input common-card" v-model="input" placeholder="请输入单词..." :disabled="answered" @input="onInput">
        <button class="sound-btn" @click="play" :disabled="answered">🔊</button>
      </div>

      <div class="feedback common-card" v-if="answered">
        <div v-if="correct" class="correct-feedback">✓ 拼写正确！</div>
        <div v-else class="incorrect-feedback">✗ 拼写错误<br><span class="answer">正确答案：{{ current.word }}</span></div>
      </div>

      <div class="action-buttons">
        <button v-if="!answered && input.trim()" class="check-btn common-card" @click="check">检查</button>
        <button v-if="answered && correct" class="next-btn common-card" @click="nextWord">下一个</button>
        <button v-if="answered && !correct" class="retry-btn common-card" @click="retry">重新拼写</button>
      </div>
    </div>

    <div class="completed-section common-card" v-else>
      <div class="icon-circle">🏆</div>
      <h3>拼写测试完成！</h3>
      <div class="stats">
        <div><span class="num">{{ totalCount }}</span><span class="label">总测试单词</span></div>
        <div><span class="num">{{ accuracy }}%</span><span class="label">正确率</span></div>
      </div>
      <div class="completed-buttons">
        <button class="retry-btn" @click="restart">再次测试</button>
        <button class="home-btn" @click="home">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useLearnStore } from '@/store/learn'
import { pronounceWord } from '@/utils/speech'
import { getTodayLearned } from '@/api/learn'
export default {
  name: 'Spelling',
  data() {
    return {
      idx: 0,
      list: [],
      input: '',
      answered: false,
      correct: false,
      isCompleted: false,
      correctCount: 0
    }
  },
  computed: {
    ...mapState(useLearnStore, ['currentLevel']),
    totalCount() { return this.list.length },
    current() { return this.list[this.idx] || { meaning: '' } },
    accuracy() { return this.totalCount ? Math.round((this.correctCount / this.totalCount) * 100) : 0 }
  },
  async created() {
    await this.hydrate()
    const userId = localStorage.getItem('userId')
    const level = this.currentLevel
    this.list = this.shuffle(await getTodayLearned(userId, level))
  },
  methods: {
    ...mapActions(useLearnStore, ['hydrate']),
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    },
    onInput(e) { this.input = e.target.value.toLowerCase() },
    play() { pronounceWord(this.current.word) },
    check() {
      this.answered = true
      this.correct = this.input.trim().toLowerCase() === this.current.word.toLowerCase()
      if (this.correct) this.correctCount++
    },
    nextWord() {
      if (this.idx >= this.list.length - 1) this.isCompleted = true
      else { this.idx++; this.reset() }
    },
    retry() { this.reset() },
    reset() { this.input = ''; this.answered = false; this.correct = false },
    restart() {
  this.idx = 0
  this.reset()
  this.isCompleted = false
  this.correctCount = 0
  const userId = localStorage.getItem('userId')
  const level = this.currentLevel
  getTodayLearned(userId, level).then(list => {
    this.list = this.shuffle(list)
  })
},
    home() { this.$router.replace('/home') }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
.spelling-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding: var(--space);
  display: flex;
  flex-direction: column;
}
.spelling-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-lg);
  position: relative;
  .back-btn {
    position: absolute;
    left: 0;
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    border: none;
    font-size: var(--text-lg);
  }
  .header-title {
    font-size: var(--text-xl);
    font-weight: 800;
    color: #333;
  }
}
.spelling-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.empty-state {
  text-align: center;
  padding: var(--space-xl);
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space);
  .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space);
  }
  .empty-text {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #555;
  }
  .empty-subtext {
    font-size: var(--text-base);
    color: #666;
  }
  .start-learn-btn {
    @include btn;
    width: 10rem;
    height: 2.6rem;
    font-size: var(--text-base);
  }
}
.word-meaning {
  @include card;
  padding: var(--space-lg);
}
.meaning-label {
  font-size: var(--text-base);
  font-weight: 600;
  color: #555;
  margin-bottom: var(--space-sm);
  display: block;
}
.meaning-item {
  font-size: var(--text-base);
  line-height: 1.6;
}
.definition {
  color: #555;
}
.input-area {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}
.common-input {
  flex: 1;
  height: 2.8rem;
  padding: 0 var(--space);
  font-size: var(--text-base);
  color: #555;
  background: var(--glass);
  border: none;
  border-radius: var(--radius);
}
.sound-btn {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: var(--radius);
  background: var(--primary);
  color: #fff;
  border: none;
}
.feedback {
  padding: var(--space-lg);
  text-align: center;
  font-size: var(--text-base);
}
.correct-feedback {
  color: #52c41a;
}
.incorrect-feedback {
  color: #ff4d4f;
}
.answer {
  display: block;
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  background: rgba(111, 168, 255, 0.1);
  border-radius: var(--radius);
  color: var(--primary);
}
.action-buttons {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}
.check-btn,
.next-btn,
.retry-btn {
  flex: 1;
  height: 2.8rem;
  border-radius: var(--radius);
  background: var(--primary);
  color: #fff;
  font-size: var(--text-base);
  font-weight: 600;
  border: none;
}
.completed-section {
  text-align: center;
  padding: var(--space-xl);
}
.icon-circle {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-lg);
  font-size: 2rem;
}
.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-xl);
}
.num {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary);
}
.label {
  font-size: 0.9rem;
  color: #666;
}
.completed-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space);
}
.retry-btn,
.home-btn {
  height: 2.8rem;
  border-radius: var(--radius);
  font-size: var(--text-base);
  font-weight: 600;
}
.retry-btn {
  background: var(--primary);
  color: #fff;
}
.home-btn {
  background: var(--glass);
  color: var(--primary);
}
</style>