#!/usr/bin/env node
/** 扫描 public/reports/push-*.md,生成 index.json(文件名列表)。
 *
 * GitHub Pages 无法列目录,前端靠这份索引知道有哪些报告文件。
 * 作为 npm run build 的 prebuild 钩子自动执行,也可单独运行:
 *   node scripts/generate-index.mjs
 */
import { readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const reportsDir = join(dirname(fileURLToPath(import.meta.url)), '../public/reports')

const files = readdirSync(reportsDir)
  .filter((name) => /^push-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}(?:-week)?\.md$/.test(name))
  .sort()
  .reverse() // id 即时间串,倒序 = 最新在前

writeFileSync(join(reportsDir, 'index.json'), JSON.stringify(files, null, 2) + '\n')
console.log(`reports/index.json: ${files.length} 篇报告`)
