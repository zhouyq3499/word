<template>
  <div class="register-page">
    <div class="box common-card">
      <h1 class="title">用户注册</h1>
      <div class="input-group">
        <div class="item">
          <input v-model="form.username" placeholder="用户名">
        </div>
        <div class="item">
          <input v-model="form.password" type="password" placeholder="密码（≥6位）">
        </div>
        <div class="item">
          <input v-model="form.confirm" type="password" placeholder="确认密码">
        </div>
      </div>
      <button class="btn" @click="register">注册</button>
      <p class="link">已有账号？<span @click="$router.replace('/login')">立即登录</span></p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { form: { username: '', password: '', confirm: '' } }
  },
  methods: {
    register() {
      if (!this.form.username || !this.form.password || this.form.password !== this.form.confirm || this.form.password.length < 6) {
        alert('请检查输入')
        return
      }
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      if (users.find(u => u.username === this.form.username)) {
        alert('用户名已存在')
        return
      }
      users.push({ username: this.form.username, password: this.form.password })
      localStorage.setItem('registeredUsers', JSON.stringify(users))
      alert('注册成功')
      this.$router.replace('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
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
    }
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
      }
    }
  }
}
</style>