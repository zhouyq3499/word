// import { defineStore } from 'pinia'
// import { getWords, submitResult, getLevelProgress } from '@/api/learn'
// import { mockWords } from '@/mock/words'

// const STORAGE_KEY = 'word-master-learn'

// export const useLearnStore = defineStore('learn', {
//   state: () => ({
//     currentLevel: 'CET4',
//     currentUser: '',
//     words: [],
//     targetCount: 15,
//     currentIndex: 0,
//     learnedRecords: [],
//     wordBook: [],
//     hydrated: false
//   }),

//   getters: {
//     currentWord: (state) => state.words[state.currentIndex] || null,
    
//     // 当前进度：当前用户 + 当前等级下已学习的单词数量
//     currentProgress: (state) =>
//       state.learnedRecords.filter(
//         w => w.level === state.currentLevel && w.user === state.currentUser
//       ).length,
    
//     learnedWordsByLevel: (state) =>
//       state.learnedRecords.filter(
//         w => w.level === state.currentLevel && w.user === state.currentUser
//       ),
    
//     reviewList: (state) =>
//       state.learnedRecords.filter(
//         w => w.level === state.currentLevel && w.user === state.currentUser
//       ),
    
//     userWordBook: (state) =>
//       state.wordBook.filter(w => w.user === state.currentUser),
    
//     // 修正：使用 state 参数
//     progress: (state) => 
//       state.learnedRecords.filter(
//         w => w.level === state.currentLevel && w.user === state.currentUser
//       ).length,
    
//     // 修正：使用普通函数形式，通过 this 访问 state
//     totalWords() {
//       return mockWords.filter(w => w.level === this.currentLevel).length
//     }
//   },

//   actions: {
//     async hydrate() {
//       if (this.hydrated) return
//       const saved = localStorage.getItem(STORAGE_KEY)
//       if (saved) {
//         const p = JSON.parse(saved)
//         this.currentLevel = p.currentLevel || 'CET4'
//         this.currentUser = p.currentUser || ''
//         this.learnedRecords = p.learnedRecords || []
//         this.wordBook = p.wordBook || []
//       } else {
//         const loginUser = localStorage.getItem('currentUser')
//         if (loginUser) this.currentUser = JSON.parse(loginUser).username
//       }
//       this.hydrated = true
//     },

//     persist() {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify({
//         currentLevel: this.currentLevel,
//         currentUser: this.currentUser,
//         learnedRecords: this.learnedRecords,
//         wordBook: this.wordBook
//       }))
//     },

//     loginUser(userInfo) {
//       this.currentUser = userInfo.username
//       this.persist()
//       this.hydrated = false
//       return this.hydrate()
//     },

//     logoutUser() {
//       this.currentUser = ''
//       this.learnedRecords = []
//       this.wordBook = []
//       this.persist()
//     },

//     async fetchWords(level = this.currentLevel, keepProgress = false) {
//       await this.hydrate()
//       this.currentLevel = level
//       const res = await getWords(level)
//       this.words = res.data.words || []
//       this.targetCount = res.data.targetCount || this.words.length || 0
      
//       // 只有不保持进度时才重置为0
//       if (!keepProgress) {
//         this.currentIndex = 0
//       }
//     },

//     async loadLevelIfEmpty(level = this.currentLevel) {
//       await this.hydrate()
//       this.currentLevel = level
      
//       try {
//         // 获取当前用户ID
//         const userId = localStorage.getItem('userId')
//         if (!userId) {
//           console.warn('未找到用户ID，从头开始')
//           await this.fetchWords(level)
//           this.currentIndex = 0
//           return
//         }
        
//         // 从后端获取该用户在该等级下的已学单词数量
//         const progressData = await getLevelProgress(level)
//         const learnedCount = progressData.learnedCount || 0
        
//         // 重要：获取单词列表时告诉它保持当前进度
//         await this.fetchWords(level, true)  // 第二个参数 true 表示保持进度
        
//         if (learnedCount > 0 && this.words.length > 0) {
//           // 设置当前索引为已学单词数量（取模防止越界）
//           this.currentIndex = learnedCount % this.words.length
          
//           // 关键：同步本地 learnedRecords
//           // 先清空当前用户当前等级的前端记录
//           const otherRecords = this.learnedRecords.filter(
//             w => !(w.level === this.currentLevel && w.user === this.currentUser)
//           )
          
//           // 重新构建 learnedRecords
//           const newLearnedRecords = []
//           for (let i = 0; i < learnedCount && i < this.words.length; i++) {
//             const word = this.words[i]
//             if (word) {
//               newLearnedRecords.push({
//                 ...word,
//                 level: this.currentLevel,
//                 user: this.currentUser,
//                 isKnown: true
//               })
//             }
//           }
          
//           this.learnedRecords = [...otherRecords, ...newLearnedRecords]
//           this.persist()
          
//           console.log(`从数据库同步进度: 已学 ${learnedCount} 个单词，当前索引: ${this.currentIndex}`)
//         } else {
//           // 数据库没有学习记录，从头开始
//           this.currentIndex = 0
//           console.log('数据库无学习记录，从头开始')
//         }
//       } catch (error) {
//         console.error('获取学习进度失败，使用本地记录', error)
        
//         // 降级方案：使用本地记录
//         await this.fetchWords(level, true)
        
//         // 注意：这里要使用正确的getter调用方式
//         const learnedWords = this.learnedRecords.filter(
//           w => w.level === this.currentLevel && w.user === this.currentUser
//         )
//         const hasLocalRecord = learnedWords.length > 0
        
//         if (!hasLocalRecord) {
//           this.currentIndex = 0
//         } else {
//           this.currentIndex = learnedWords.length % this.words.length || 0
//         }
//       }
//     },

//     nextWord() {
//       if (this.currentIndex < this.words.length - 1) this.currentIndex++
//       else this.currentIndex = 0
//     },

//     async recordResult({ word, isCorrect }) {
//       if (!word) return false
//       const payload = {
//         ...word,
//         level: word.level || this.currentLevel,
//         user: this.currentUser,
//         isKnown: isCorrect
//       }
//       const idx = this.learnedRecords.findIndex(w => w.id === payload.id && w.user === this.currentUser)
//       if (idx === -1) this.learnedRecords.push(payload)
//       else this.learnedRecords.splice(idx, 1, payload)

//       let added = false
      
//       // 使用正确的getter调用方式
//       const userWordBook = this.wordBook.filter(w => w.user === this.currentUser)
//       if (!isCorrect && !userWordBook.find(w => w.id === payload.id)) {
//         this.wordBook.push(payload)
//         added = true
//       }
      
//       this.persist()
//       await submitResult(payload.id, isCorrect)
//       return added
//     },

//     addToWordBook(word) {
//       if (!word) return
      
//       // 使用正确的getter调用方式
//       const userWordBook = this.wordBook.filter(w => w.user === this.currentUser)
//       if (!userWordBook.find(w => w.id === word.id)) {
//         this.wordBook.push({ ...word, user: this.currentUser })
//         this.persist()
//       }
//     },

//     removeFromWordBook(word) {
//       this.wordBook = this.wordBook.filter(w => !(w.id === word.id && w.user === this.currentUser))
//       this.persist()
//     },

//     async changeLevel(level) {
//       await this.fetchWords(level)
//       this.persist()
//     },
    
//     // 新增：手动设置当前索引（用于调试）
//     setCurrentIndex(index) {
//       if (index >= 0 && index < this.words.length) {
//         this.currentIndex = index
//       }
//     },

    


//   }
// })

import { defineStore } from 'pinia'
import { getWords, submitResult, getLevelProgress } from '@/api/learn'
import { getUserInfo, updateLevel, updateDailyTarget } from '@/api/user'
import { mockWords } from '@/mock/words'

const STORAGE_KEY = 'word-master-learn'

export const useLearnStore = defineStore('learn', {
  state: () => ({
    userId: null,
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
    currentWord: (state) => state.words[state.currentIndex] || null,
    
    // 当前进度：当前用户 + 当前等级下已学习的单词数量
    currentProgress: (state) =>
      state.learnedRecords.filter(
        w => w.level === state.currentLevel && w.user === state.currentUser
      ).length,
    
    learnedWordsByLevel: (state) =>
      state.learnedRecords.filter(
        w => w.level === state.currentLevel && w.user === state.currentUser
      ),
    
    reviewList: (state) =>
      state.learnedRecords.filter(
        w => w.level === state.currentLevel && w.user === state.currentUser
      ),
    
    userWordBook: (state) =>
      state.wordBook.filter(w => w.user === state.currentUser),
    
    // 使用 state 参数
    progress: (state) => 
      state.learnedRecords.filter(
        w => w.level === state.currentLevel && w.user === state.currentUser
      ).length,
    
    // 返回当前等级的实际单词总数
    totalWords: (state) => {
      // 如果words数组有数据，返回实际数量
      if (state.words && state.words.length > 0) {
        return state.words.length
      }
      // 否则返回mock数据作为备用
      return mockWords.filter(w => w.level === state.currentLevel).length
    }
  },

  actions: {
    async hydrate() {
      if (this.hydrated) return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        this.currentLevel = p.currentLevel || 'CET4'
        this.currentUser = p.currentUser || ''
        this.userId = p.userId || null
        this.targetCount = p.targetCount || 15
        this.learnedRecords = p.learnedRecords || []
        this.wordBook = p.wordBook || []
      } else {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          const user = JSON.parse(userInfo)
          this.currentUser = user.username
          this.userId = user.id
          this.currentLevel = user.currentLevel || 'CET4'
          this.targetCount = user.dailyTarget || 15
        }
      }
      this.hydrated = true
    },

    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userId: this.userId,
        currentLevel: this.currentLevel,
        currentUser: this.currentUser,
        targetCount: this.targetCount,
        learnedRecords: this.learnedRecords,
        wordBook: this.wordBook
      }))
    },

    // 登录用户（从数据库加载）
    async loginUser(userData) {
      this.userId = userData.id
      this.currentUser = userData.username
      this.currentLevel = userData.currentLevel || 'CET4'
      this.targetCount = userData.dailyTarget || 15
      
      this.persist()
      this.hydrated = false
      return this.hydrate()
    },

    logoutUser() {
      this.userId = null
      this.currentUser = ''
      this.currentLevel = 'CET4'
      this.targetCount = 15
      this.learnedRecords = []
      this.wordBook = []
      this.persist()
    },

    async fetchWords(level = this.currentLevel, keepProgress = false) {
      await this.hydrate()
      this.currentLevel = level
      const res = await getWords(level)
      this.words = res.data.words || []
      // targetCount 从用户设置获取，不从这里覆盖
      
      // 只有不保持进度时才重置为0
      if (!keepProgress) {
        this.currentIndex = 0
      }
    },

    async loadLevelIfEmpty(level = this.currentLevel) {
      await this.hydrate()
      this.currentLevel = level
      
      try {
        const userId = this.userId
        if (!userId) {
          console.warn('未找到用户ID，从头开始')
          await this.fetchWords(level)
          this.currentIndex = 0
          return
        }
        
        // 从后端获取该用户在该等级下的已学单词数量
        const progressData = await getLevelProgress(level)
        const learnedCount = progressData.learnedCount || 0
        
        // 获取单词列表时保持当前进度
        await this.fetchWords(level, true)
        
        if (learnedCount > 0 && this.words.length > 0) {
          // 设置当前索引为已学单词数量（取模防止越界）
          this.currentIndex = learnedCount % this.words.length
          
          // 同步本地 learnedRecords
          const otherRecords = this.learnedRecords.filter(
            w => !(w.level === this.currentLevel && w.user === this.currentUser)
          )
          
          // 重新构建 learnedRecords
          const newLearnedRecords = []
          for (let i = 0; i < learnedCount && i < this.words.length; i++) {
            const word = this.words[i]
            if (word) {
              newLearnedRecords.push({
                ...word,
                level: this.currentLevel,
                user: this.currentUser,
                isKnown: true
              })
            }
          }
          
          this.learnedRecords = [...otherRecords, ...newLearnedRecords]
          this.persist()
          
          console.log(`从数据库同步进度: 已学 ${learnedCount} 个单词，当前索引: ${this.currentIndex}`)
        } else {
          this.currentIndex = 0
        }
      } catch (error) {
        console.error('获取学习进度失败，使用本地记录', error)
        
        await this.fetchWords(level, true)
        
        const learnedWords = this.learnedRecords.filter(
          w => w.level === this.currentLevel && w.user === this.currentUser
        )
        const hasLocalRecord = learnedWords.length > 0
        
        if (!hasLocalRecord) {
          this.currentIndex = 0
        } else {
          this.currentIndex = learnedWords.length % this.words.length || 0
        }
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
        level: word.level || this.currentLevel,
        user: this.currentUser,
        isKnown: isCorrect
      }
      const idx = this.learnedRecords.findIndex(w => w.id === payload.id && w.user === this.currentUser)
      if (idx === -1) this.learnedRecords.push(payload)
      else this.learnedRecords.splice(idx, 1, payload)

      let added = false
      
      const userWordBook = this.wordBook.filter(w => w.user === this.currentUser)
      if (!isCorrect && !userWordBook.find(w => w.id === payload.id)) {
        this.wordBook.push(payload)
        added = true
      }
      
      this.persist()
      await submitResult(payload.id, isCorrect)
      return added
    },

    addToWordBook(word) {
      if (!word) return
      
      const userWordBook = this.wordBook.filter(w => w.user === this.currentUser)
      if (!userWordBook.find(w => w.id === word.id)) {
        this.wordBook.push({ ...word, user: this.currentUser })
        this.persist()
      }
    },

    removeFromWordBook(word) {
      this.wordBook = this.wordBook.filter(w => !(w.id === word.id && w.user === this.currentUser))
      this.persist()
    },

    async changeLevel(level) {
      this.currentLevel = level
      await this.fetchWords(level)
      
      // 同步到数据库
      if (this.userId) {
        try {
          await updateLevel(this.userId, level)
        } catch (error) {
          console.error('同步等级到数据库失败:', error)
        }
      }
      
      this.persist()
    },
    
    async updateDailyTarget(target) {
      this.targetCount = target
      
      // 同步到数据库
      if (this.userId) {
        try {
          await updateDailyTarget(this.userId, target)
        } catch (error) {
          console.error('同步每日目标到数据库失败:', error)
        }
      }
      
      this.persist()
    },
    
    async syncUserLearningData() {
      if (!this.userId) return
      
      try {
        // 从数据库获取用户最新信息
        const userData = await getUserInfo(this.userId)
        if (userData.success) {
          this.currentLevel = userData.user.currentLevel || 'CET4'
          this.targetCount = userData.user.dailyTarget || 15
          
          // 同步学习进度
          await this.loadLevelIfEmpty(this.currentLevel)
        }
        
        return true
      } catch (error) {
        console.error('同步用户学习数据失败:', error)
        return false
      }
    },
    
    setCurrentIndex(index) {
      if (index >= 0 && index < this.words.length) {
        this.currentIndex = index
      }
    }
  }
})