// 复制以下代码直接粘贴
/**
 * 获取当前登录用户的ID，未登录则跳转到登录页
 * @returns {String|null} userId
 */
export const getCurrentUserId = () => {
  // 从localStorage取userId
  const userId = localStorage.getItem('userId')
  // 没有userId则强制跳登录页
  if (!userId) {
    // 适配vue-router的hash模式，根据你的路由模式调整
    window.location.href = '/#/login'
    return null
  }
  return userId
}

/**
 * 退出登录（可选，后期用）
 */
export const logout = () => {
  localStorage.removeItem('userId')
  window.location.href = '/#/login'
}