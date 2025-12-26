<template>
  <div class="word-card common-card">
    <div class="word-header">
      <span class="word">{{ word.word }}</span>
      <button class="sound-btn" @click="play">🔊</button>
    </div>
    <div class="phonetic" v-if="word.phonetic">/{{ word.phonetic }}/</div>
    <div class="meaning">
      <div class="meaning-item" v-for="(m,i) in displayMeaning" :key="i">
        <span class="def">{{ m }}</span>
      </div>
    </div>
    <div class="actions" v-if="showDelete">
      <button class="del" @click="$emit('delete-word',word)">删除</button>
    </div>
  </div>
</template>

<script>
import { pronounceWord } from '@/utils/speech'
export default {
  props: { word: { type: Object, required: true }, showDelete: { type: Boolean, default: false } },
  computed: {
    displayMeaning () {
      if (Array.isArray(this.word.meaning)) return this.word.meaning
      if (typeof this.word.meaning === 'string') return [this.word.meaning]
      return []
    }
  },
  methods: { play () { pronounceWord(this.word.word) } }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
.word-card {
  @include card;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  .word-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .word {
      font-size: var(--text-xl);
      font-weight: 800;
      color: #333;
    }
    .sound-btn {
      width: 2.4rem;
      height: 2.4rem;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      border: none;
      font-size: 1rem;
    }
  }
  .phonetic {
    font-size: var(--text-base);
    color: #666;
    font-style: italic;
  }
  .meaning-item {
    font-size: var(--text-base);
    line-height: 1.6;
  }
  .def {
    color: #555;
  }
  .actions {
    text-align: right;
    margin-top: var(--space-sm);
  }
  .del {
    @include btn;
    background: #ff4d4f;
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
