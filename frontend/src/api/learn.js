import { fetchWordsByLevel } from './index.js';
import axios from 'axios';

// 1. 创建两个 Axios 实例
const WORDS_API = axios.create({
  baseURL: 'http://localhost:8081/api/words',
  timeout: 5000
});

const USERS_API = axios.create({
  baseURL: 'http://localhost:8081/api/users',
  timeout: 5000
});

// 统一取 userId
function getUid() {
  return localStorage.getItem('userId')
}

/**
 * 获取指定等级的单词列表
 */
export async function getWords(level) {
  try {
    const list = await fetchWordsByLevel(level);

    return {
      data: {
        words: list.map(w => ({
          id: w.id,
          level: w.level,
          word: w.word,
          // 如果 meaning 为空，尝试取 definition 的第一段
          meaning: w.meaning || (w.definition ? w.definition.split(';')[0] : '暂无释义'),
          phonetic: w.phonetic,
          // 处理后端返回的 options (字符串转 JSON 对象)
          options: typeof w.options === 'string' ? JSON.parse(w.options) : w.options
        })),
        learnedCount: 0,
        targetCount: list.length
      }
    };
  } catch (error) {
    console.error('获取单词列表失败:', error);
    throw error;
  }
}

/**
 * 提交学习/复习结果到数据库
 */
export async function submitResult(wordId, isCorrect, source = 'learn') {
  const response = await WORDS_API.post('/submit', {
    wordId,
    isCorrect,
    userId: getUid(),
    source // ✅ 传入来源
  })
  return response.data
}

/**
 * 获取复习列表
 */
export async function getReviewList(level) {
  const response = await WORDS_API.get('/review-list', {
    params: { level, userId: getUid() }
  })
  return response.data
}

/**
 * 获取当前等级的学习进度
 */
export async function getLevelProgress(level) {
  const response = await WORDS_API.get(`/learned-count/${level}`, {
    params: { userId: getUid() }
  })
  return { learnedCount: response.data }
}

export async function getWordBook(userId) {
  const res = await WORDS_API.get(`/word-book/${userId}`)
  return res.data
}

export async function addToWordBook(userId, wordId) {
  await WORDS_API.post('/word-book/add', { userId, wordId })
}

export async function removeFromWordBook(userId, wordId) {
  await WORDS_API.delete('/word-book/remove', { data: { userId, wordId } })
}

export async function getTodayLearned(userId, level) {
  const res = await WORDS_API.get('/today-learned', {
    params: { userId, level }
  })
  return res.data
}

/**
 * 获取学习统计数据
 */
export async function getLearningStats(userId) {
  try {
    const response = await WORDS_API.get(`/stats/${userId}`)
    return response.data
  } catch (error) {
    console.error('获取学习统计数据失败:', error)
    return {
      CET4: 0,
      CET6: 0,
      KaoYan: 0,
      total: 0,
      todayCount: 0
    }
  }
}

/**
 * 获取用户准确率
 */
export async function getAccuracy(userId) {
  try {
    const response = await USERS_API.get(`/accuracy/${userId}`)  // ✅ 使用 USERS_API
    return response.data
  } catch (error) {
    console.error('获取准确率失败:', error)
    return { accuracy: 0, total: 0, correct: 0, success: false }
  }
}

/**
 * 获取用户在某个等级的准确率
 */
export async function getAccuracyByLevel(userId, level) {
  try {
    const response = await USERS_API.get(`/accuracy/${userId}/${level}`)  // ✅ 使用 USERS_API
    return response.data
  } catch (error) {
    console.error('获取等级准确率失败:', error)
    return { accuracy: 0, total: 0, correct: 0, success: false }
  }
}