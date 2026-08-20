import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 公开版为纯静态站点,数据来自 public/reports/ 下的 md 文件,无后端代理。
  // base 用相对路径:配合 hash 路由,无论部署在根路径(自定义域名)还是
  // 仓库名子路径(USER.github.io/AI4S-Daily-HTML/)都能正常工作。
  base: './',
  plugins: [vue()],
})
