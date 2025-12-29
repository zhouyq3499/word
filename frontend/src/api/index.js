// src/api/index.js
const BASE = 'http://localhost:8081/api';   // 后端地址

export async function fetchWord(word, level = 'CET4') {
  const res = await fetch(`${BASE}/words/fetch?word=${word}&level=${level}`, {
    method: 'POST'   // 后端是 @PostMapping
  });
  if (!res.ok) throw new Error('网络错误');
  return res.json();
}

export async function getWord(word) {
  const res = await fetch(`${BASE}/words/${word}`);
  if (!res.ok) throw new Error('网络错误');
  return res.json();
}
export async function fetchWordsByLevel(level) {
  const res = await fetch(`${BASE}/words/list/${level}`);
  if (!res.ok) throw new Error('拉词失败');
  return res.json(); // 返回 Word 数组
}
