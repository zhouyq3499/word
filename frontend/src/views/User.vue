<template>
  <div class="user-page">
    <header class="user-header">
      <h2 class="header-title">个人中心</h2>
    </header>

    <!-- 用户信息区 -->
    <section class="user-info common-card">
      <div class="avatar">😀</div>
      <div class="info-text">
        <div class="name-row">
          <span class="nickname">{{ nickname }}</span>
          <span class="badge">学习勋章</span>
        </div>
        <div class="level">目标等级：{{ profile.levelLabel }}</div>
        <div class="level bio-line" @click="openBioModal">
          简介：{{ profile.bio || '这个人很低调，还没有写简介' }}
        </div>
      </div>
    </section>

    <!-- 数据看板 -->
    <section class="stats-row">
      <div class="stat-card">
        <div class="label">已学{{ levelLabel }}词汇</div>
        <div class="value">{{ learnedCount }}</div>
        <div class="hint">共 {{ totalWords }} 词</div>
      </div>
      <div class="stat-card">
        <div class="label">连续打卡</div>
        <div class="value">{{ stats.streak }}天</div>
      </div>
      <div class="stat-card">
        <div class="label">准确率</div>
        <div class="value">{{ accuracyValue }}%</div>
        <div class="hint">{{ accuracyData.correct }}/{{ accuracyData.total }}</div>
      </div>
    </section>

    <!-- 功能列表 -->
    <section class="feature-list common-card">
      <!-- 每日目标设置 -->
      <div class="feature-item">
        <span class="icon">🎯</span>
        <div class="text">
          <div class="title">每日学习目标</div>
          <div class="desc">当前：{{ userDailyTarget }} 词/天</div>
        </div>
        <select class="select" :value="userDailyTarget" @change="handleDailyTargetChange($event)">
          <option value="10">10 词/天</option>
          <option value="15">15 词/天</option>
          <option value="20">20 词/天</option>
          <option value="30">30 词/天</option>
          <option value="50">50 词/天</option>
        </select>
      </div>
      
      <!-- 词库选择 -->
      <div class="feature-item">
        <span class="icon">📚</span>
        <div class="text">
          <div class="title">我的词库选择</div>
          <div class="desc">当前：{{ levelLabel }}词汇</div>
        </div>
        <select class="select" :value="selectedLevel" @change="handleLevelChange($event)">
          <option value="CET4">CET-4</option>
          <option value="CET6">CET-6</option>
          <option value="KaoYan">考研词汇</option>
        </select>
      </div>
      
      <!-- 每日学习提醒 -->
      <div class="feature-item">
        <span class="icon">⏰</span>
        <div class="text">
          <div class="title">每日学习提醒</div>
          <div class="desc">当前：{{ reminder }}</div>
        </div>
        <button class="mini-btn" @click="toggleReminder">{{ reminderOn ? '已开启' : '去开启' }}</button>
      </div>
      
      <!-- 退出登录 -->
      <div class="feature-item danger" @click="logout">
        <span class="icon">🚪</span>
        <div class="text">
          <div class="title">退出登录</div>
          <div class="desc">清除本地登录状态</div>
        </div>
        <span class="arrow">›</span>
      </div>
    </section>

    <bottom-nav />

    <!-- 编辑简介模态框 -->
    <div v-if="showBioModal" class="modal-mask">
      <div class="modal">
        <h3 class="modal-title">编辑个人简介</h3>
        <textarea v-model="tempBio" class="modal-textarea" placeholder="写点介绍或学习宣言吧"></textarea>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="cancelBio">取消</button>
          <button class="modal-btn confirm" @click="saveBio">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useLearnStore } from '@/store/learn'
import { getAccuracyByLevel } from '@/api/learn'
import { getUserInfo, updateBio } from '@/api/user'
import { mockWords } from '@/mock/words'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'User',
  components: { BottomNav },
  data() {
    return {
      profile: {
        nickname: '',
        levelLabel: 'CET-4',
        bio: '这个人很低调，还没有写简介'
      },
      selectedLevel: 'CET4',
      userDailyTarget: 15,
      stats: { streak: 0 },
      reminder: '每日 19:30',
      reminderOn: true,
      showBioModal: false,
      tempBio: '',
      accuracyData: {
        accuracy: 0,
        total: 0,
        correct: 0
      }
    }
  },
  computed: {
    ...mapState(useLearnStore, {
      currentUser: 'currentUser',
      learnedCount: 'progress',
      totalWordsFromStore: 'totalWords',
      learnedList: 'learnedWordsByLevel',
      targetCount: 'targetCount'
    }),
    
    levelLabel() {
      const labels = {
        'CET4': '四级',
        'CET6': '六级',
        'KaoYan': '考研'
      }
      return labels[this.selectedLevel] || '词汇'
    },
    
    totalWords() {
      return this.totalWordsFromStore || mockWords.filter(w => w.level === this.selectedLevel).length
    },
    
    nickname() {
      return this.currentUser || this.profile.nickname || '未命名'
    },
    
    accuracyValue() {
      return this.accuracyData.accuracy || 0
    }
  },
  watch: {
    targetCount: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal !== this.userDailyTarget) {
          this.userDailyTarget = newVal
        }
      }
    },
    
    selectedLevel: {
      immediate: true,
      async handler(newLevel) {
        await this.loadAccuracyData(newLevel)
      }
    }
  },
  async created() {
    const store = useLearnStore()
    
    // 从store获取初始值
    this.selectedLevel = store.currentLevel
    this.userDailyTarget = store.targetCount
    
    // 从数据库加载用户信息
    await this.loadUserProfile()
    
    // 同步数据库的用户设置
    await store.syncUserLearningData()
    
    // 再次更新数据（从数据库同步后）
    this.userDailyTarget = store.targetCount
    this.selectedLevel = store.currentLevel
    this.profile.levelLabel = this.getLevelLabel(this.selectedLevel)
    
    // 初始加载准确率数据
    await this.loadAccuracyData(this.selectedLevel)
  },
  methods: {
    ...mapActions(useLearnStore, ['changeLevel', 'updateDailyTarget', 'logoutUser']),
    
    // 从数据库加载用户信息
    async loadUserProfile() {
      const userId = localStorage.getItem('userId')
      if (!userId) return

      try {
        const res = await getUserInfo(userId)
        if (res.success && res.user) {
          // 更新界面显示
          this.profile.nickname = res.user.username
          this.selectedLevel = res.user.currentLevel
          this.userDailyTarget = res.user.dailyTarget
          this.stats.streak = res.streakDays || 0
          
          // 从数据库获取个人简介
          this.profile.bio = res.user.bio || '这个人很低调，还没有写简介'
          
          // 更新等级标签
          this.profile.levelLabel = this.getLevelLabel(this.selectedLevel)
        }
      } catch (e) {
        console.error('获取用户信息失败', e)
      }
    },
    
    async handleLevelChange(event) {
      const level = event.target.value
      this.selectedLevel = level
      this.profile.levelLabel = this.getLevelLabel(level)
      
      // 调用store的action更新数据库
      await this.changeLevel(level)
      // 等级变化后重新加载准确率
      await this.loadAccuracyData(level)
    },
    
    async handleDailyTargetChange(event) {
      const target = parseInt(event.target.value)
      this.userDailyTarget = target
      
      // 调用store的action更新数据库
      await this.updateDailyTarget(target)
    },
    
    async loadAccuracyData(level) {
      const userId = localStorage.getItem('userId')
      if (userId && level) {
        try {
          const data = await getAccuracyByLevel(userId, level)
          if (data.success) {
            this.accuracyData = {
              accuracy: data.accuracy || 0,
              total: data.total || 0,
              correct: data.correct || 0
            }
          }
        } catch (error) {
          console.error('加载准确率数据失败:', error)
          // 降级方案：使用前端计算
          this.calculateFrontendAccuracy(level)
        }
      } else {
        // 如果没有userId，使用前端计算
        this.calculateFrontendAccuracy(level)
      }
    },
    
    // 前端计算准确率（降级方案）
    calculateFrontendAccuracy(level) {
      const store = useLearnStore()
      
      // 获取当前用户在当前等级的所有学习记录
      const userRecords = store.learnedRecords.filter(
        w => w.user === this.currentUser && w.level === level
      )
      
      if (userRecords.length === 0) {
        this.accuracyData = { accuracy: 0, total: 0, correct: 0 }
        return
      }
      
      // 假设 learnedRecords 中有 isCorrect 字段
      // 如果没有，使用 isKnown 作为替代
      const correctCount = userRecords.filter(w => {
        return w.isCorrect !== undefined ? w.isCorrect : w.isKnown
      }).length
      
      const accuracy = Math.round((correctCount / userRecords.length) * 100)
      
      this.accuracyData = {
        accuracy,
        total: userRecords.length,
        correct: correctCount
      }
    },
    
    getLevelLabel(level) {
      if (level === 'CET4') return 'CET-4'
      else if (level === 'CET6') return 'CET-6'
      else return '考研词汇'
    },
    
    openBioModal() {
      this.tempBio = this.profile.bio
      this.showBioModal = true
    },
    
    cancelBio() {
      this.showBioModal = false
    },
    
    async saveBio() {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        alert('请先登录')
        return
      }
      
      const bio = this.tempBio.trim()
      const finalBio = bio || '这个人很低调，还没有写简介'
      
      try {
        // 保存到后端数据库
        const result = await updateBio(userId, finalBio)
        
        if (result.success) {
          this.profile.bio = finalBio
          this.showBioModal = false
          
          // 更新本地存储的用户信息
          const userInfo = localStorage.getItem('userInfo')
          if (userInfo) {
            const user = JSON.parse(userInfo)
            user.bio = finalBio
            localStorage.setItem('userInfo', JSON.stringify(user))
          }
          
          alert('个人简介更新成功')
        } else {
          alert(result.message || '更新失败')
        }
      } catch (error) {
        console.error('保存个人简介失败:', error)
        alert('保存失败，请稍后重试')
      }
    },
    
    toggleReminder() {
      this.reminderOn = !this.reminderOn
      this.saveLocalSettings()
    },
    
    saveLocalSettings() {
      const settings = {
        profile: this.profile,
        stats: this.stats,
        reminder: this.reminder,
        reminderOn: this.reminderOn
      }
      localStorage.setItem('user-settings', JSON.stringify(settings))
    },
    
    logout() {
      localStorage.removeItem('userId')
      localStorage.removeItem('userInfo')
      this.logoutUser()
      this.$router.replace('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.user-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  padding: var(--space-sm) var(--space) var(--space-xl);
  padding-bottom: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space);
}

.user-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: var(--space-sm);
  .header-title {
    font-size: var(--text-xl);
    font-weight: 800;
    color: #333;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space);
  padding: var(--space-lg);
}

.avatar {
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #7fb3ff, #4c8dff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #fff;
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.name-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nickname {
  font-size: var(--text-lg);
  font-weight: 800;
  color: #333;
}

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 193, 7, 0.2);
  color: #b57a00;
  font-weight: 700;
  font-size: var(--text-sm);
}

.level {
  font-size: var(--text-sm);
  color: #666;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space);
}

.stat-card {
  @include card;
  padding: var(--space-lg);
  text-align: center;
  
  .label {
    font-size: var(--text-sm);
    color: #666;
    margin-bottom: var(--space-xs);
  }
  
  .value {
    font-size: 1.6rem;
    font-weight: 800;
    color: #333;
    margin-bottom: var(--space-xs);
  }
  
  .hint {
    font-size: var(--text-xs);
    color: #888;
  }
}

.feature-list {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space);
  padding: var(--space);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
}

.feature-item.danger .title {
  color: #ff4d4f;
}

.icon {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: rgba(79, 139, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.title {
  font-weight: 700;
  color: #333;
}

.desc {
  font-size: var(--text-sm);
  color: #666;
}

.arrow {
  color: #999;
  font-size: 1.2rem;
}

.mini-btn {
  @include btn;
  padding: 0.3rem 0.7rem;
  font-size: var(--text-sm);
}

.select {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius);
  padding: 0.3rem 0.6rem;
  background: #fff;
  font-size: var(--text-base);
  font-weight: 600;
  min-width: 7rem;
}

.bio-line {
  cursor: pointer;
  color: #4f8bff;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  width: min(90%, 21rem);
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  border-radius: 1rem;
  padding: var(--space-lg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: var(--space);
}

.modal-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 800;
  color: #1f2937;
}

.modal-textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-height: 6rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius);
  padding: var(--space);
  font-size: var(--text-base);
  background: #fff;
  color: #333;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: var(--space);
  justify-content: flex-end;
}

.modal-btn {
  @include btn;
  padding: 0.5rem 1rem;
  border: none;
  font-weight: 700;
}

.modal-btn.cancel {
  background: rgba(0, 0, 0, 0.05);
  color: #555;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #4f8bff, #7fb3ff);
  color: #fff;
}
</style>