import { defineConfig } from 'vite'
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  },
  plugins: [
    {
      name: 'copy-js-files',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        const jsDir = resolve(__dirname, 'js')
        const distJsDir = resolve(distDir, 'js')

        if (existsSync(jsDir)) {
          cpSync(jsDir, distJsDir, { recursive: true })
        }

        const stylesFile = resolve(__dirname, 'styles.css')
        if (existsSync(stylesFile)) {
          copyFileSync(stylesFile, resolve(distDir, 'styles.css'))
        }
      }
    }
  ]
})
