import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api/users',
  timeout: 5000
});

// 用户注册
export async function register(username, password) {
  try {
    const response = await API.post('/register', { username, password });
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
}

// 用户登录
export async function login(username, password) {
  try {
    const response = await API.post('/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

// 获取用户信息
export async function getUserInfo(userId) {
  try {
    const response = await API.get(`/${userId}`);
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

// 更新词库等级
export async function updateLevel(userId, level) {
  try {
    const response = await API.put(`/${userId}/level`, { level });
    return response.data;
  } catch (error) {
    console.error('更新等级失败:', error);
    throw error;
  }
}

// 更新每日目标
export async function updateDailyTarget(userId, target) {
  try {
    const response = await API.put(`/${userId}/target`, { target });
    return response.data;
  } catch (error) {
    console.error('更新每日目标失败:', error);
    throw error;
  }
}