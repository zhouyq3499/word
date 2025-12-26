import { mockWords } from '@/mock/words'

export function getWords(level) {
  const words = mockWords.filter(w => w.level === level)
  return Promise.resolve({
    data: {
      words,
      learnedCount: 0,
      targetCount: words.length
    }
  })
}

export function submitResult(wordId, correct) {
  console.log('mock submit:', wordId, correct)
  return Promise.resolve({ success: true })
}
