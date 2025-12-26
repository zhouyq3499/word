import { defineStore } from 'pinia'
import { getWords, submitResult } from '@/api/learn'
import { mockWords } from '@/mock/words'

const STORAGE_KEY = 'word-master-learn'

export const useLearnStore = defineStore('learn', {
  state: () => ({
    currentLevel: 'CET4',
    currentUser: '',
    words: [],
    targetCount: 15,
    currentIndex: 0,
    learnedRecords: [],
    wordBook: [],
    hydrated: false
  }),

  getters: {
    currentWord: state => state.words[state.currentIndex] || null,
    // 当前进度：当前用户 + 当前等级下已学习的单词数量
    currentProgress: state =>
      state.learnedRecords.filter(
        w => w.level === state.currentLevel && w.user === state.currentUser
      ).length,
    learnedWordsByLevel: state =>
      state.learnedRecords.filter(
        w => w.level === state.currentLevel && w.user === state.currentUser
      ),
    reviewList: state =>
      state.learnedRecords.filter(
        w => w.level === state.currentLevel && w.user === state.currentUser
      ),
    userWordBook: state =>
      state.wordBook.filter(w => w.user === state.currentUser),
    progress: state => state.learnedWordsByLevel.length,
    totalWords: state => mockWords.filter(w => w.level === state.currentLevel).length
  },

  actions: {
    async hydrate() {
      if (this.hydrated) return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        this.currentLevel = p.currentLevel || 'CET4'
        this.currentUser = p.currentUser || ''
        this.learnedRecords = p.learnedRecords || []
        this.wordBook = p.wordBook || []
      } else {
        const loginUser = localStorage.getItem('currentUser')
        if (loginUser) this.currentUser = JSON.parse(loginUser).username
      }
      this.hydrated = true
    },

    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentLevel: this.currentLevel,
        currentUser: this.currentUser,
        learnedRecords: this.learnedRecords,
        wordBook: this.wordBook
      }))
    },

    loginUser(userInfo) {
      this.currentUser = userInfo.username
      this.persist()
      this.hydrated = false
      return this.hydrate()
    },

    logoutUser() {
      this.currentUser = ''
      this.learnedRecords = []
      this.wordBook = []
      this.persist()
    },

    async fetchWords(level = this.currentLevel) {
      await this.hydrate()
      this.currentLevel = level
      const res = await getWords(level)
      this.words = res.data.words || []
      this.targetCount = res.data.targetCount || this.words.length || 0
      this.currentIndex = 0
    },

    // 有记录就复用，不再重置；无记录才拉词库
    async loadLevelIfEmpty(level = this.currentLevel) {
      await this.hydrate()
      this.currentLevel = level
      const hasRecord = this.learnedWordsByLevel.length > 0
      if (!hasRecord) {
        await this.fetchWords(level)
      } else {
        this.currentIndex = this.learnedWordsByLevel.length % this.words.length || 0
      }
    },

    nextWord() {
      if (this.currentIndex < this.words.length - 1) this.currentIndex++
      else this.currentIndex = 0
    },

    async recordResult({ word, isCorrect }) {
      if (!word) return false
      const payload = {
        ...word,
        level: word.level || this.currentLevel, // 必须带level
        user: this.currentUser,
        isKnown: isCorrect
      }
      const idx = this.learnedRecords.findIndex(w => w.id === payload.id && w.user === this.currentUser)
      if (idx === -1) this.learnedRecords.push(payload)
      else this.learnedRecords.splice(idx, 1, payload)

      let added = false
      if (!isCorrect && !this.userWordBook.find(w => w.id === payload.id)) {
        this.wordBook.push(payload)
        added = true
      }
      this.persist()
      await submitResult(payload.id, isCorrect)
      return added
    },

    addToWordBook(word) {
      if (!word) return
      if (!this.userWordBook.find(w => w.id === word.id)) {
        this.wordBook.push({ ...word, user: this.currentUser })
        this.persist()
      }
    },

    removeFromWordBook(word) {
      this.wordBook = this.wordBook.filter(w => !(w.id === word.id && w.user === this.currentUser))
      this.persist()
    },

    async changeLevel(level) {
      await this.fetchWords(level)
      this.persist()
    }
  }
})
