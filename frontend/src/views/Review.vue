<template>
  <div class="review-page">
    <header class="review-header">
      <button class="back-btn" @click="home">←</button>
      <h2 class="header-title">单词复习</h2>
    </header>

    <div class="review-progress common-card">
      <div class="progress-info">
        <span>复习进度</span>
        <span class="progress-count">{{ idx + 1 }}/{{ reviewList.length }}</span>
      </div>
      <div class="progress-bar">
        <div class="fill" :style="{ width: fillWidth }"></div>
      </div>
    </div>

    <div class="empty-state common-card" v-if="reviewList.length === 0">
      <div class="empty-icon">📖</div>
      <p v-if="learnedWordsByLevel.length">恭喜！所有单词都已掌握</p>
      <p v-else>今天还没有学习单词哦~</p>
      <p class="empty-subtext">完成学习后才能进行复习</p>
      <button class="start-learn-btn" @click="$router.push('/learn')">去学习</button>
    </div>

    <div class="review-content" v-else-if="!isCompleted">
      <div class="word-section common-card">
        <div class="review-word">
          <span class="word-text">{{ current.word }}</span>
          <button class="sound-btn" @click="play">🔊</button>
        </div>
        <div v-if="showMeaning" class="meaning-box common-card">
          <span class="meaning-text">{{ current.meaning || '' }}</span>
        </div>
      </div>

      <div class="btn-bar">
        <div class="stage-btns" v-if="!showMeaning">
          <button class="text-btn green" @click="stage('know')">认识</button>
          <button class="text-btn yellow" @click="stage('fuzzy')">模糊</button>
          <button class="text-btn red" @click="stage('forget')">忘记了</button>
        </div>
        <div class="result-btns" v-else>
          <button class="text-btn green" @click="next">
            {{ idx >= reviewList.length - 1 ? '完成复习' : '下一词' }}
          </button>
          <button v-if="stageStatus !== 'forget'" class="text-btn red" @click="wrong">记错了</button>
        </div>
      </div>
    </div>

    <div class="completed-section common-card" v-else>
      <div class="icon-circle">✔</div>
      <h3>复习完成！</h3>
      <div class="stats">
        <div><span class="num">{{ totalReviewed }}</span><span class="label">复习单词</span></div>
        <div><span class="num">{{ accuracy }}%</span><span class="label">正确率</span></div>
      </div>
      <div class="completed-buttons">
        <button class="retry-btn" @click="restart">再复习一次</button>
        <button class="home-btn" @click="home">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useLearnStore } from '@/store/learn'
import { pronounceWord } from '@/utils/speech'
import axios from 'axios' // 确保这行存在
import { submitResult } from '@/api/learn'
// ✅ 新增：导入封装的API函数
import { getReviewList } from '@/api/learn'

export default {
  data() {
    return {
      idx: 0,
      isCompleted: false,
      correct: 0,
      showMeaning: false,
      stageStatus: '',
      list: [],
      totalReviewed: 0
    }
  },
  computed: {
    ...mapState(useLearnStore, ['learnedWordsByLevel', 'userWordBook', 'currentLevel']),
    current() { return this.reviewList[this.idx] || {} },
    reviewList() { 
      return this.list.length > 0 ? this.list : this.learnedWordsByLevel 
    },
    fillWidth() { return this.reviewList.length ? `${((this.idx + 1) / this.reviewList.length) * 100}%` : '0%' },
    accuracy() { return this.totalReviewed ? Math.round((this.correct / this.totalReviewed) * 100) : 0 }
  },
  async created() {
    try {
      await this.hydrate()  // 确保store已初始化
      
      // ✅ 方案1：使用导入的getReviewList函数
      const level = this.currentLevel || 'CET4'
      const reviewData = await getReviewList(level)
      
      // ✅ 修复：调用本地定义的shuffle方法
      this.list = this.shuffle(reviewData || [])
      
      if (this.list.length === 0) {
        console.log("还没有学过单词，复习列表为空")
        // 降级方案：使用本地已学单词
        this.list = this.shuffle([...this.learnedWordsByLevel])
      }
    } catch (e) {
      console.error("加载复习列表失败", e)
      // 错误处理：使用本地数据
      this.list = this.shuffle([...this.learnedWordsByLevel])
    }
  },
  methods: {
    ...mapActions(useLearnStore, ['hydrate', 'addToWordBook']),
    
    // ✅ 新增：shuffle方法（从Spelling.vue复制过来）
    shuffle(arr) {
      const array = [...arr]  // 创建副本
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    },
    
    // ✅ 新增：初始化方法
    async init() {
      await this.hydrate()
      this.idx = 0
      this.isCompleted = false
      this.correct = 0
      this.showMeaning = false
      this.stageStatus = ''
      this.totalReviewed = 0
    },
    
    home() { this.$router.replace('/home') },
    play() { pronounceWord(this.current.word) },
    
    async stage(type) {
      this.stageStatus = type
      this.showMeaning = true
      this.totalReviewed++

      const isCorrect = (type === 'know' || type === 'fuzzy')

      if (type === 'forget') {
        if (!this.userWordBook.find(w => w.id === this.current.id)) {
          await this.addToWordBook(this.current)
        }
      } else {
        this.correct++
      }

      // 同步到后端数据库
      try {
        await submitResult(this.current.id, isCorrect)
        console.log(`复习记录同步成功: ID ${this.current.id}, 结果: ${isCorrect}`)
      } catch (e) {
        console.error("同步复习结果失败", e)
      }
    },

    async wrong() {
      this.correct = Math.max(0, this.correct - 1)
      try {
        await submitResult(this.current.id, false)
      } catch (e) {
        console.error("更新错误结果失败", e)
      }
      if (!this.userWordBook.find(w => w.id === this.current.id)) {
        await this.addToWordBook(this.current)
      }
      this.next()
    },
    
    next() {
      if (this.idx >= this.reviewList.length - 1) {
        this.isCompleted = true
      } else {
        this.idx++
        this.showMeaning = false
        this.stageStatus = ''
      }
    },
    
    restart() {
      this.idx = 0
      this.isCompleted = false
      this.correct = 0
      this.totalReviewed = 0
      this.showMeaning = false
      this.stageStatus = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
.review-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding: var(--space);
  .review-header {
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
  .review-progress {
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
  .progress-bar {
    height: 0.6rem;
    background: rgba(225, 240, 255, 0.7);
    border-radius: 0.3rem;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--primary);
    border-radius: 0.3rem;
    transition: width 0.3s;
  }
  .empty-state {
    text-align: center;
    padding: var(--space-xl);
  }
  .empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-lg);
  }
  .empty-subtext {
    font-size: var(--text-base);
    color: #666;
    margin: var(--space-sm) 0 var(--space-xl);
  }
  .start-learn-btn {
    @include btn;
    width: 10rem;
    height: 2.4rem;
    font-size: var(--text-base);
  }
  .review-content {
    display: flex;
    flex-direction: column;
  }
  .word-section {
    @include card;
    padding: var(--space-xl);
    margin-bottom: var(--space-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .review-word {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }
  .word-text {
    font-size: var(--text-xxl);
    font-weight: 800;
    color: #333;
  }
  .sound-btn {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    border: none;
  }
  .meaning-box {
    padding: var(--space-lg);
    background: rgba(111, 168, 255, 0.1);
    border-radius: var(--radius);
  }
  .meaning-text {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #555;
  }
  .btn-bar {
    margin-top: auto;
    padding-bottom: var(--space-xl);
  }
  .stage-btns,
  .result-btns {
    display: flex;
    gap: var(--space-sm);
  }
  .text-btn {
    flex: 1;
    height: 2.4rem;
    border-radius: var(--radius);
    font-size: var(--text-base);
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    border: none;
  }
  .green {
    background: rgba(82, 196, 26, 0.8);
  }
  .yellow {
    background: rgba(250, 173, 20, 0.8);
  }
  .red {
    background: rgba(255, 77, 79, 0.8);
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
    height: 2.4rem;
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
}
</style>