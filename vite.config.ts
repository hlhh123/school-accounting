import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages(프로젝트 사이트)는 /school-accounting/ 하위 경로로 서빙되므로
// 프로덕션 빌드에서만 base 를 지정합니다. (로컬 개발/미리보기는 '/')
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/school-accounting/' : '/',
  plugins: [react()],
}))
