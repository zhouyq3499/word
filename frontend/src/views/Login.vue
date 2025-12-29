<template>
  <div class="login-page">
    <div class="box common-card">
      <h1 class="title">单词记忆大师</h1>
      <div class="input-group">
        <div class="item">
          <input v-model="form.username" placeholder="请输入用户名" @keyup.enter="login">
        </div>
        <div class="item">
          <input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="login">
        </div>
      </div>
      <button class="btn" @click="login">登录</button>
      <p class="link">
        还没有账号？
        <span @click="$router.push('/register')">立即注册</span>
      </p>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user'
import { useLearnStore } from '@/store/learn'
import { getLevelProgress } from '@/api/learn'
export default {
  name: 'Login',
  data() {
    return { 
      form: { 
        username: '', 
        password: '' 
      } 
    }
  },
  methods: {
    async login() {
      if (!this.form.username.trim() || !this.form.password.trim()) {
        alert('请输入用户名和密码')
        return
      }
      
      try {
        const result = await login(this.form.username, this.form.password)
        
        if (result.success) {
          const user = result.user
          
          // 保存到 store
          const store = useLearnStore()
          await store.loginUser(user)
          
          // 保存到 localStorage
          localStorage.setItem('userId', user.id)
          localStorage.setItem('userInfo', JSON.stringify(user))
          
          // ✅ 关键修改：直接调用 fetchWords 而不是 syncUserLearningData
      console.log('登录成功，开始加载单词数据...')
      await store.fetchWords(user.currentLevel || 'CET4')
      
      // ✅ 获取学习进度
      try {
        const progressData = await getLevelProgress(store.currentLevel)
        const learnedCount = progressData.learnedCount || 0
        console.log(`学习进度: ${learnedCount} 个单词`)
        
        if (learnedCount > 0 && store.words.length > 0) {
          // 直接更新 learnedRecords
          const newRecords = []
          for (let i = 0; i < learnedCount && i < store.words.length; i++) {
            const word = store.words[i]
            newRecords.push({
              id: word.id,
              word: word.word,
              meaning: word.meaning,
              level: store.currentLevel,
              user: store.currentUser,
              isKnown: true
            })
          }
          
          // 合并记录
          store.learnedRecords = [
            ...store.learnedRecords.filter(w => !(w.level === store.currentLevel && w.user === store.currentUser)),
            ...newRecords
          ]
          
          store.persist()
          console.log(`✅ 已同步 ${newRecords.length} 个学习记录`)
        }
      } catch (error) {
        console.error('获取学习进度失败:', error)
      }
      
      this.$router.replace('/home')
    } else {
      alert(result.message || '登录失败')
    }
  } catch (error) {
    alert('登录失败：' + error.message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
}
.box {
  width: 90%;
  max-width: 30rem;
  padding: var(--space-xl);
  @include card;
  text-align: center;
  .title {
    font-size: var(--text-xl);
    font-weight: 800;
    margin-bottom: var(--space-xl);
    color: #333;
  }
  .input-group {
    margin-bottom: var(--space-xl);
  }
  .item {
    margin-bottom: var(--space-lg);
    input {
      width: 100%;
      height: 2.4rem;
      box-sizing: border-box;
      border: none;
      border-radius: var(--radius);
      padding: 0 var(--space);
      font-size: var(--text-base);
      color: #555;
      background: rgba(255, 255, 255, 0.6);
      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--primary);
      }
    }
  }
  .btn {
    @include btn;
    width: 100%;
    margin-top: var(--space-lg);
  }
  .link {
    margin-top: var(--space-lg);
    font-size: var(--text-base);
    color: #666;
    span {
      color: var(--primary);
      cursor: pointer;
      font-weight: 600;
    }
  }
}
</style>