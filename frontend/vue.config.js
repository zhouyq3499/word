const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 你的后端地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api' // 如果后端接口本身带 /api，这里就保持原样
        }
      }
    }
  }
})