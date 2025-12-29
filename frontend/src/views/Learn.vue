<template>
  <div class="learn-page">
    <header class="learn-header">
      <button class="back-btn" @click="$router.replace('/home')">←</button>
      <h2 class="header-title">学习模式</h2>
    </header>

    <section class="progress-section common-card">
      <div class="progress-info">
        <span>学习进度</span>
        <span class="progress-count">{{ todayLearnedCount }}/{{ targetCount }}</span>
      </div>
      <progress-bar :current="currentProgress" :target="targetCount"/>
    </section>

    <div class="word-panel common-card" v-if="!isCompleted && currentWord">
      <div class="word-container">
        <div class="word-row">
          <span class="word-text">{{ currentWord.word }}</span>
          <button class="sound-btn" @click="play">🔊</button>
        </div>
        <span class="phonetic" v-if="currentWord.phonetic">[{{ currentWord.phonetic }}]</span>
      </div>
    </div>

    <div class="options-section" v-if="!isCompleted && options.length">
      <div
        v-for="(opt, idx) in options"
        :key="idx"
        class="option common-card"
        :class="optClass(idx)"
        @click="select(idx)"
      >
        <span class="option-letter">{{ String.fromCharCode(65 + idx) }}</span>
        <span class="option-text">{{ opt.label }}</span>
        <span v-if="showAnswer && opt.correct" class="correct-tag">✓</span>
      </div>
      <button class="bottom-btn common-card" @click="next">{{ bottomText }}</button>
    </div>

    <div class="completed-section common-card" v-if="isCompleted">
      <div class="icon-circle">✓</div>
      <h3>恭喜完成今日学习目标！</h3>
      <div class="stats">
        <div><span class="num">{{ targetCount }}</span><span class="label">学习单词</span></div>
        <div><span class="num">{{ newWordsInBook }}</span><span class="label">加入单词本</span></div>
      </div>
      <div class="completed-buttons">
        <button class="continue-btn" @click="restart">继续学习</button>
        <button class="home-btn" @click="$router.replace('/home')">返回首页</button>
      </div>
    </div>

    <div class="empty-state common-card" v-if="!isCompleted && !currentWord">
      <div class="empty-icon">📚</div>
      <p>今天已学完所有单词，明天再来吧！</p>
      <button class="start-learn-btn" @click="$router.replace('/home')">返回首页</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useLearnStore } from '@/store/learn'
import { pronounceWord } from '@/utils/speech'
import ProgressBar from '@/components/ProgressBar.vue'
import { getTodayLearned } from '@/api/learn'
export default {
  components: { ProgressBar },
  data() {
    return {
      options: [],
      selectedIdx: null,
      showAnswer: false,
      newWordsInBook: 0,
       todayLearnedCount: 0,
      isCompleted: false
    }
  },
  computed: {
    ...mapState(useLearnStore, ['currentWord', 'targetCount', 'currentProgress']),
    bottomText() {
      return this.showAnswer ? '下一题' : '看答案'
    }
  },
  async created() {
    const store = useLearnStore()
    await store.hydrate()
    await store.loadLevelIfEmpty()
    this.prepareOptions()
    this.checkCompleted()
  const userId = localStorage.getItem('userId')
  const level = store.currentLevel
  const todayLearned = await getTodayLearned(userId, level)
  this.todayLearnedCount = todayLearned.length
  },
  methods: {
    ...mapActions(useLearnStore, ['hydrate', 'loadLevelIfEmpty', 'recordResult', 'nextWord']),
    prepareOptions() {
      if (!this.currentWord) { this.options = []; return }
      this.options = this.shuffle((this.currentWord.options || []).map(o => ({
        label: o.label,
        correct: !!o.correct
      })))
      this.selectedIdx = null
      this.showAnswer = false
    },
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    },
    async select(idx) {
  if (this.showAnswer) return
  this.selectedIdx = idx
  this.showAnswer = true
  const option = this.options[idx]
  const added = await this.recordResult({ word: this.currentWord, isCorrect: option.correct })
  const userId = localStorage.getItem('userId')
  const level = useLearnStore().currentLevel
  const todayLearned = await getTodayLearned(userId, level)
  this.todayLearnedCount = todayLearned.length
  if (added) this.newWordsInBook++
  this.checkCompleted()
},
    next() {
      if (!this.showAnswer) { this.showAnswer = true; return }
      this.nextWord()
      this.prepareOptions()
      this.checkCompleted()
    },
    checkCompleted() {
  if (this.todayLearnedCount >= this.targetCount && this.targetCount > 0) {
    this.isCompleted = true
  }
},
    restart() {
      this.isCompleted = false
      this.newWordsInBook = 0
      this.prepareOptions()
    },
    play() { pronounceWord(this.currentWord?.word) },
    optClass(idx) {
      if (!this.showAnswer) return idx === this.selectedIdx ? 'selected' : ''
      if (this.options[idx].correct) return 'correct'
      if (idx === this.selectedIdx && !this.options[idx].correct) return 'incorrect'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.learn-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding: var(--space);
  padding-bottom: var(--space-xl);
}

.learn-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-lg);
  position: relative;
  .back-btn {
    position: absolute;
    left: 0;
    width: 2.4rem;
    height: 2.4rem;
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

.progress-section {
  @include card;
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-base);
  font-weight: 600;
  color: #555;
  margin-bottom: var(--space-sm);
}

.progress-count {
  color: var(--primary);
}

.word-panel {
  @include card;
  padding: var(--space-xl) var(--space-lg);
  margin-bottom: var(--space-lg);
  display: flex;
  justify-content: center;
}

.word-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.word-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.word-text {
  font-size: var(--text-xxl);
  font-weight: 800;
  color: #333;
}

.phonetic {
  font-size: var(--text-base);
  color: #666;
}

.sound-btn {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  border: none;
}

.option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  margin-bottom: var(--space);
  border-radius: var(--radius);
  @include card;
  position: relative;
}

.option.selected {
  border: 2px solid var(--primary);
}

.option.correct {
  background: rgba(82, 196, 26, 0.8);
  color: #fff;
  transform: scale(1.02);
}

.option.incorrect {
  background: rgba(255, 77, 79, 0.8);
  color: #fff;
  transform: scale(1.02);
}

.option-letter {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
}

.option-text {
  flex: 1;
  font-size: var(--text-base);
}

.correct-tag {
  position: absolute;
  right: var(--space-lg);
  font-size: var(--text-lg);
  color: #fff;
}

.bottom-btn {
  @include btn;
  width: 100%;
  margin-top: var(--space-lg);
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

.continue-btn,
.home-btn {
  height: 2.4rem;
  border-radius: var(--radius);
  font-size: var(--text-base);
  font-weight: 600;
}

.continue-btn {
  background: var(--primary);
  color: #fff;
}

.home-btn {
  background: var(--glass);
  color: var(--primary);
}

.empty-state {
  text-align: center;
  padding: var(--space-xl);
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-lg);
  }
  
  p {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #333;
    margin-bottom: var(--space);
  }
  
  .start-learn-btn {
    @include btn;
    width: 10rem;
    height: 2.4rem;
    font-size: var(--text-base);
    background: var(--primary);
    color: #fff;
    border-radius: var(--radius);
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s;
    margin-top: var(--space-xl);
    
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>