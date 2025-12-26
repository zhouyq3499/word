<template>
  <div class="login-page">
    <div class="box common-card">
      <h1 class="title">单词记忆大师</h1>
      <div class="input-group">
        <div class="item"><input v-model="form.username" placeholder="请输入用户名"></div>
        <div class="item"><input v-model="form.password" type="password" placeholder="请输入密码"></div>
      </div>
      <button class="btn" @click="login">登录</button>
      <p class="link">还没有账号？<span @click="$router.push('/register')">立即注册</span></p>
    </div>
  </div>
</template>

<script>
export default {
  data(){ return { form:{username:'admin',password:'123456'} } },
  methods:{
    login(){
      if(!this.form.username.trim()||!this.form.password.trim()) return alert('请输入完整')
      localStorage.setItem('mock-token','fake-token')
      this.$router.replace('/home')
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
