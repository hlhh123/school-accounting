import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 커스텀 도메인(anedu.org)으로 루트 경로에서 서빙하므로 base 는 '/' 로 둡니다.
// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
})
