import { copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'easyar-dist')
const dest = join(root, 'public', 'ar-easyar')

mkdirSync(dest, { recursive: true })
copyFileSync(join(src, 'index.html'), join(dest, 'index.html'))
copyFileSync(join(src, 'bundle.js'), join(dest, 'bundle.js'))

console.log('Copied easyar index.html + bundle.js → public/ar-easyar/')
