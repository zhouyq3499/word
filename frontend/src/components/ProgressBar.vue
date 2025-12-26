<template>
  <div class="progress-bar">
    <div class="fill" :style="{width:percent}"></div>
  </div>
</template>

<script>
export default {
  props: { current: { type: Number, default: 0 }, target: { type: Number, default: 10 } },
  computed: {
    percent() {
      if (!this.target) return '0%'
      const ratio = Math.min(1, Math.max(0, this.current / this.target))
      return `${Math.round(ratio * 100)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-bar {
  height: 0.6rem;
  background: rgba(225, 240, 255, 0.7);
  border-radius: 0.3rem;
  overflow: hidden;
  .fill {
    height: 100%;
    background: rgba(111, 168, 255, 0.8);
    border-radius: 0.3rem;
    transition: width 0.3s;
  }
}
</style>
