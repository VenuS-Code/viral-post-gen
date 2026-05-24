import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: Change 'viral-post-gen' to YOUR GitHub repository name
const REPO_NAME = 'viral-post-gen'

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
})
