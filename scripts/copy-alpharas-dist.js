import { cpSync, rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'alpharas-dist')
const dest = join(root, 'public', 'ar-alpharas')

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true })
}

cpSync(src, dest, { recursive: true })
console.log('Copied alpharas-dist/ → public/ar-alpharas/')
