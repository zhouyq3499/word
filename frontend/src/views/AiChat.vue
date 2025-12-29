<template>
  <div class="ai-chat-page">
    <header class="chat-header">
      <h2 class="header-title">AI 英语助手</h2>
      <p class="header-sub">基于 DeepSeek 的英语学习助手</p>
    </header>

    <main class="chat-body" ref="msgBox">
      <div
        v-for="(m, i) in messages"
        :key="i"
        :class="['message', m.role]"
      >
        <div class="avatar">{{ m.role === 'user' ? '👤' : '🤖' }}</div>
        <div class="bubble">
          <div v-if="m.role==='ai'" v-html="m.content"/>
          <div v-else>{{ m.content }}</div>
          <div class="time">{{ m.time }}</div>
        </div>
      </div>
      <div v-if="loading" class="message ai">
        <div class="avatar">🤖</div>
        <div class="bubble">思考中…</div>
      </div>
    </main>

    <footer class="chat-footer">
      <div class="quick-asks">
        <button
          v-for="(q, i) in quickQuestions"
          :key="i"
          @click="quickAsk(q)"
          :disabled="loading"
        >{{ q }}</button>
      </div>
      <div class="input-bar">
        <input
          v-model="userInput"
          @keyup.enter="send"
          placeholder="输入英语问题..."
          :disabled="loading"
        >
        <button @click="send" :disabled="!userInput.trim() || loading">发送</button>
      </div>
    </footer>

    <bottom-nav />
  </div>
</template>

<script>
import axios from 'axios'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'AiChat',
  components: { BottomNav },
  data () {
    return {
      userInput: '',
      loading: false,
      messages: [
        { role: 'ai', content: '你好！我是你的英语学习助手，可以帮你解释单词、分析句子、提供学习建议等。', time: new Date().toLocaleTimeString() }
      ],
      quickQuestions: [
        '解释单词 "abandon"',
        '分析这个句子结构',
        '帮我练习英语口语',
        '推荐英语学习方法'
      ]
    }
  },
  methods: {
    async send () {
      if (!this.userInput.trim() || this.loading) return
      this.messages.push({ role: 'user', content: this.userInput.trim(), time: new Date().toLocaleTimeString() })
      this.scrollBottom()
      const input = this.userInput
      this.userInput = ''
      this.loading = true
      try {
        const { data } = await axios.post('/api/ai/chat', { message: input })
        if (data.success) {
          this.messages.push({ role: 'ai', content: data.reply, time: new Date().toLocaleTimeString() })
        } else {
          this.messages.push({ role: 'ai', content: '服务暂时不可用，稍后再试~', time: new Date().toLocaleTimeString() })
        }
      } catch (e) {
        this.messages.push({ role: 'ai', content: '网络错误：' + (e.response?.data?.msg || e.message), time: new Date().toLocaleTimeString() })
      } finally {
        this.loading = false
        this.scrollBottom()
      }
    },
    quickAsk (q) {
      this.userInput = q
      this.send()
    },
    scrollBottom () {
      this.$nextTick(() => {
        const box = this.$refs.msgBox
        if (box) box.scrollTop = box.scrollHeight
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-page{
  height:100vh;
  display:flex;
  flex-direction:column;
  background: linear-gradient(135deg,#f0f8ff,#e6f3ff);
  overflow:hidden;
  /* 考虑底部导航栏高度，重新分配空间 */
  height: calc(100vh - 60px); /* 减去导航栏高度 */
  margin-bottom: 60px; /* 为导航栏留出空间 */
}

.chat-header{
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction: column;
  padding:1rem;
  background:#fff;
  box-shadow:0 2px 6px rgba(0,0,0,.06);
  flex-shrink: 0; /* 防止头部被压缩 */
  .header-title{
    margin:0;
    font-size:1.5rem; /* 增大标题字体 */
    font-weight:700;
    color: #2c3e50;
  }
  .header-sub{
    margin: 4px 0 0 0;
    font-size:.85rem; /* 增大副标题字体 */
    color:#666;
  }
}

.chat-body{
  flex:1;
  overflow-y:auto;
  padding:.8rem;
  box-sizing:border-box;
  /* 增加底部内边距，确保最后一条消息不被遮挡 */
  padding-bottom: 120px; /* 增大底部内边距，为输入区和导航栏留空间 */
  margin-bottom: 0;
  min-height: 0; /* 允许内容区域缩小 */
}

.message{
  display:flex;
  margin-bottom:.8rem;
  gap:.6rem;
  &.user{flex-direction:row-reverse}
  .avatar{
    width:2.5rem;height:2.5rem;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:1.3rem;background:#6fa8ff;color:#fff;
    flex-shrink: 0; /* 防止头像被压缩 */
  }
  .bubble{
    max-width:70%;padding:.8rem 1.2rem;border-radius:1rem;
    font-size:1rem;
    line-height:1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
    .time{
      font-size:.7rem;
      opacity:.7;
      margin-top:.3rem;
      text-align:right
    }
  }
  &.user .bubble{
    background:#6fa8ff;
    color:#fff;
    font-size: 1rem;
  }
  &.ai   .bubble{
    background:#fff;
    color:#333;
    box-shadow:0 2px 6px rgba(0,0,0,.08);
    font-size: 1rem;
  }
}

.chat-footer{
  background:#fff;
  border-top:1px solid #eee;
  padding:.8rem;
  box-sizing:border-box;
  flex-shrink: 0; /* 防止输入区被压缩 */
  /* 为底部导航栏留出空间 */
  margin-bottom: 60px;
  position: relative;
  z-index: 10;
}

.quick-asks{
  display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.8rem;
  button{
    background:rgba(111,168,255,.12);color:#6fa8ff;
    border:none;border-radius:1rem;padding:.4rem .9rem;
    font-size:.85rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.input-bar{
  display:flex;gap:.5rem;
  input{
    flex:1;height:2.5rem;border:1px solid #ddd;
    border-radius:1.25rem;padding:0 1rem;
    font-size:1rem;
  }
  button{
    width:4rem;height:2.5rem;border:none;border-radius:1.25rem;
    background:#6fa8ff;color:#fff;font-size:1rem;
  }
}

/* 确保整个页面不会超出视口 */
.ai-chat-page {
  position: relative;
}
</style>