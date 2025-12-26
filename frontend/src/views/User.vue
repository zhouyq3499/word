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
        <div class="level">目标：{{ profile.levelLabel }}</div>
        <div class="level bio-line" @click="openBioModal">
          简介：{{ profile.bio || '这个人很低调，还没有写简介' }}
        </div>
      </div>
    </section>

    <!-- 数据看板 -->
    <section class="stats-row">
      <div class="stat-card">
        <div class="label">词汇量</div>
        <div class="value">{{ vocabDisplay }}</div>
      </div>
      <div class="stat-card">
        <div class="label">连续打卡</div>
        <div class="value">{{ stats.streak }}天</div>
      </div>
      <div class="stat-card">
        <div class="label">准确率</div>
        <div class="value">{{ accuracyValue }}%</div>
      </div>
    </section>

    <!-- 功能列表 -->
    <section class="feature-list common-card">
      <div class="feature-item">
        <span class="icon">📚</span>
        <div class="text">
          <div class="title">我的词库选择</div>
          <div class="desc">请选择词库</div>
        </div>
        <select class="select" v-model="profile.level" @change="changeLevel(profile.level)">
          <option v-for="l in levelOptions" :key="l.value" :value="l.value">{{ l.label }}</option>
        </select>
      </div>
      <div class="feature-item">
        <span class="icon">⏰</span>
        <div class="text">
          <div class="title">每日学习提醒</div>
          <div class="desc">当前：{{ reminder }}</div>
        </div>
        <button class="mini-btn" @click="toggleReminder">{{ reminderOn ? '已开启' : '去开启' }}</button>
      </div>
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
import { mockWords } from '@/mock/words'
import BottomNav from '@/components/BottomNav.vue'

const STORAGE_KEY = 'user-profile'

export default {
  name: 'User',
  components: { BottomNav },
  computed: {
    ...mapState(useLearnStore, {
      currentUser: 'currentUser',
      currentLevel: 'currentLevel',
      learnedCount: 'progress',
      totalWordsFromStore: 'totalWords',
      learnedList: 'learnedWordsByLevel'
    }),
    nickname() {
      return this.currentUser || this.profile.nickname || '未命名'
    },
    vocabDisplay() {
      const total = this.totalWordsFromStore || mockWords.filter(w => w.level === this.profile.level).length
      return `${this.learnedCount}/${total}`
    },
    accuracyValue() {
      const total = this.learnedList.length
      if (!total) return 0
      const known = this.learnedList.filter(w => w.isKnown).length
      return Math.round((known / total) * 100)
    },
    levelOptions() {
      return [
        { label: 'CET-4', value: 'CET4' },
        { label: 'CET-6', value: 'CET6' },
        { label: '考研词汇', value: 'POSTGRADUATE' }
      ]
    }
  },
  data() {
    return {
      profile: {
        nickname: 'Kimi',
        level: 'CET4',
        levelLabel: 'CET-4',
        bio: '这个人很低调，还没有写简介'
      },
      stats: { streak: 15 },
      reminder: '每日 19:30',
      reminderOn: true,
      showBioModal: false,
      tempBio: ''
    }
  },
  async created() {
    if (this.currentUser) this.profile.nickname = this.currentUser
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const p = JSON.parse(saved)
      this.profile = { ...this.profile, ...p.profile }
      this.stats = { ...this.stats, ...p.stats }
      this.reminder = p.reminder || this.reminder
      this.reminderOn = p.reminderOn ?? this.reminderOn
    }
    this.syncLevelLabel()
    await this.changeLevel(this.profile.level)
  },
  methods: {
    ...mapActions(useLearnStore, ['changeLevel', 'fetchWords', 'hydrate', 'logoutUser']),
    async changeLevel(val) {
      this.profile.level = val
      this.syncLevelLabel()
      await this.hydrate()
      await this.fetchWords(val)
      this.save()
    },
    syncLevelLabel() {
      if (this.profile.level === 'CET4') this.profile.levelLabel = 'CET-4'
      else if (this.profile.level === 'CET6') this.profile.levelLabel = 'CET-6'
      else this.profile.levelLabel = '考研词汇'
    },
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile: this.profile,
        stats: this.stats,
        reminder: this.reminder,
        reminderOn: this.reminderOn
      }))
    },
    openBioModal() {
      this.tempBio = this.profile.bio
      this.showBioModal = true
    },
    cancelBio() {
      this.showBioModal = false
    },
    saveBio() {
      this.profile.bio = this.tempBio
      this.showBioModal = false
      this.save()
    },
    toggleReminder() {
      this.reminderOn = !this.reminderOn
      this.save()
    },
    logout() {
      localStorage.removeItem('mock-token')
      localStorage.removeItem('currentUser')
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