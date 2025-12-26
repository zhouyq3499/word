import { defineStore } from 'pinia'
import { getWords, submitResult } from '@/api/learn'

const STORAGE_KEY = 'word-master-learn'

export const useLearnStore = defineStore('learn', {
  state: () => ({
    currentLevel: 'CET4',          // CET4 | CET6 | POSTGRADUATE
    words: [],
    targetCount: 15,
    currentIndex: 0,
    learnedRecords: [],
    wordBook: [],
    hydrated: false
  }),

  getters: {
    currentWord(state) {
      return state.words[state.currentIndex] || null
    },
    learnedWordsByLevel(state) {
      return state.learnedRecords.filter(w => w.level === state.currentLevel)
    },
    reviewList(state) {
      return state.learnedRecords.filter(w => w.level === state.currentLevel)
    },
    progress(state) {
      return state.learnedRecords.filter(w => w.level === state.currentLevel).length
    }
  },

  actions: {
    hydrate() {
      if (this.hydrated) return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        this.currentLevel = parsed.currentLevel || this.currentLevel
        this.learnedRecords = parsed.learnedRecords || []
        this.wordBook = parsed.wordBook || []
      }
      this.hydrated = true
    },
    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentLevel: this.currentLevel,
          learnedRecords: this.learnedRecords,
          wordBook: this.wordBook
        })
      )
    },
    async fetchWords(level = this.currentLevel) {
      this.hydrate()
      this.currentLevel = level
      const res = await getWords(level)
      this.words = res.data.words || []
      this.targetCount = res.data.targetCount || this.words.length || 0
      this.currentIndex = 0
    },
    nextWord() {
      if (this.currentIndex < this.words.length - 1) this.currentIndex++
      else this.currentIndex = 0
    },
    async recordResult({ word, isCorrect }) {
      if (!word) return false
      const payload = { ...word, level: word.level || this.currentLevel, isKnown: isCorrect }
      const idx = this.learnedRecords.findIndex(w => w.id === payload.id)
      if (idx === -1) this.learnedRecords.push(payload)
      else this.learnedRecords.splice(idx, 1, payload)

      let added = false
      if (!isCorrect && !this.wordBook.find(w => w.id === payload.id)) {
        this.wordBook.push(payload)
        added = true
      }
      this.persist()
      await submitResult(payload.id, isCorrect)
      return added
    },
    addToWordBook(word) {
      if (!word) return
      if (!this.wordBook.find(w => w.id === word.id)) {
        this.wordBook.push({ ...word, level: word.level || this.currentLevel })
        this.persist()
      }
    },
    removeFromWordBook(word) {
      this.wordBook = this.wordBook.filter(w => w.id !== word.id)
      this.persist()
    },
    clearMasteredWords() {
      this.learnedRecords = []
      this.persist()
    },
    async changeLevel(level) {
      await this.fetchWords(level)
      this.persist()
    }
  }
})
