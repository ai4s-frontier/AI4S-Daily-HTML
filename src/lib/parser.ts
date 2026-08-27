/** 报告解析层:src/web/reports.py 的 TypeScript 移植,在浏览器中解析 push-*.md。
 *
 * 三种文件形态归一(与后端一致):
 * 1. 带 frontmatter(晚报 + 2026-08-14 起的早报) → 字段取 meta
 * 2. 无 frontmatter 的存量早报(H1 + sentinel) → 标题回退 H1,profile 按 sentinel 判定
 * 3. 无 sentinel 的晚报 → extractSection("rss") 兜底返回全文,归一化为单 rss 板块
 */

import type { ReportDetail, Section } from '../types'

const REPORT_FILE_RE = /^push-(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})(?:-week)?\.md$/
const H1_RE = /^#\s+(.+)$/m
// 多行模式:既用于在板块内 search 首个 H2,也用于判断 chunk 首行是否 H2(单行串上 ^ 仍匹配串首)
const H2_RE = /^##\s+(.+)$/m

const SECTION_TITLE_FALLBACK: Record<string, string> = {
  overview: '总览',
  insights: '今日洞察',
  plateau: '"高原"最新洞察',
  peak: '"高峰"最新洞察',
  relevance: '与当前01专项工作的相关性',
  gaps: '问题发现',
  rss: '今日Top热点',
  hackernews: 'Hacker News 热议',
  weekly: '周报洞察',
  weekly_top: '本周Top热点',
}

// insights sentinel 段内的 H2 → 子板块 key
// 带符号变体为日报模板新标题,纯文本变体保留以兼容历史报告;
// 🌄"高原"/⛰️"高峰" 为 2026-08-27 起新板块(替换 💡 今日洞察,旧 key 保留兼容历史报告)
const INSIGHTS_H2_KEYS: Record<string, string> = {
  总览: 'overview',
  '📋 总览': 'overview',
  今日洞察: 'insights',
  '💡 今日洞察': 'insights',
  '"高原"最新洞察': 'plateau',
  '🌄 "高原"最新洞察': 'plateau',
  '"高峰"最新洞察': 'peak',
  '⛰️ "高峰"最新洞察': 'peak',
}

// weekly sentinel 段内的 H2 → 子板块 key
// 带符号变体为 2026-08-24 起周报模板新标题,纯文本变体保留以兼容历史报告
const WEEKLY_H2_KEYS: Record<string, string> = {
  总览: 'weekly_overview',
  '📋 总览': 'weekly_overview',
  本周洞察: 'weekly_insights',
  '💡 本周洞察': 'weekly_insights',
  趋势分析: 'weekly_trends',
  '📈 趋势分析': 'weekly_trends',
}

// 板块顺序与后端 src/storage.py 的 _SECTION_ORDER 保持一致
const SECTION_ORDER = ['insights', 'relevance', 'gaps', 'rss', 'hackernews', 'weekly', 'weekly_top']

export function reportIdFromName(name: string): string | null {
  const m = REPORT_FILE_RE.exec(name)
  return m ? m[1] : null
}

// ─── frontmatter ───

/** 解析单行 `key: value`;值优先按 JSON 解析(dump_frontmatter 以 JSON 语法写 YAML),
 * 失败则退化为去引号字符串 / 数字 */
function parseYamlValue(raw: string): unknown {
  const v = raw.trim()
  if (!v) return ''
  try {
    return JSON.parse(v)
  } catch {
    /* 非 JSON 标量,走下方兜底 */
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  return v.replace(/^["']|["']$/g, '')
}

function parseFrontmatterOnce(text: string): [Record<string, unknown>, string] | null {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(text)
  let yamlPart: string
  let body: string
  if (m) {
    ;[yamlPart, body] = [m[1], m[2].trim()]
  } else if (text.startsWith('---')) {
    // 无闭合 fence 容错:--- 之后到第一个空行之间的内容当作 YAML 头
    const rest = text.slice(3).replace(/^\n+/, '')
    const sep = rest.indexOf('\n\n')
    if (sep < 0) return null
    yamlPart = rest.slice(0, sep)
    body = rest.slice(sep + 2).trim()
  } else {
    return null
  }

  const meta: Record<string, unknown> = {}
  for (const line of yamlPart.split('\n')) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (kv) meta[kv[1]] = parseYamlValue(kv[2])
  }
  if (!Object.keys(meta).length) return null
  return [meta, body]
}

/** 从 markdown 文本中分离 frontmatter 与正文;无 frontmatter / 解析失败返回 [{}, 原文] */
export function parseFrontmatter(text: string): [Record<string, unknown>, string] {
  let stripped = text.trim()
  // 整段被 ```markdown 代码围栏包裹(LLM 输出瑕疵)时先剥围栏
  const fence = /^```(?:markdown|yaml|md)?\s*\n([\s\S]*?)\n?```\s*$/.exec(stripped)
  if (fence) stripped = fence[1].trim()
  const first = parseFrontmatterOnce(stripped)
  if (!first) return [{}, text]
  let [meta, body] = first
  // 双 frontmatter:body 仍以 --- 开头则再剥一次,meta 保留第一份
  if (body.startsWith('---')) {
    const second = parseFrontmatterOnce(body)
    if (second) body = second[1]
  }
  return [meta, body]
}

function normalizeStrList(value: unknown): string[] {
  if (!value) return []
  const items = typeof value === 'string' ? [value] : Array.isArray(value) ? value : []
  return items.map((x) => String(x).trim()).filter(Boolean)
}

// ─── sentinel 板块切片 ───

/** 切出 <!-- SECTION:{section} BEGIN/END --> 之间的 markdown;
 * 老文件(无任何 sentinel)且 section == 'rss' 时返回全文兜底 */
function extractSection(body: string, section: string): string {
  const re = new RegExp(
    `<!--\\s*SECTION:${section}\\s*BEGIN\\s*-->([\\s\\S]*?)<!--\\s*SECTION:${section}\\s*END\\s*-->`,
  )
  const m = re.exec(body)
  if (m) return m[1]
  if (section === 'rss' && !body.includes('<!-- SECTION:')) return body
  return ''
}

/** 老文件 rss 兜底返回全文时,剥掉首行 H1(报告标题已在详情头展示) */
function stripLeadingH1(md: string): string {
  return md.replace(/^\s*#\s+[^\n]*\n*/, '').trim()
}

/** 栏目流条目剥掉板块首个 H2(栏目标题已在页面头部展示,避免重复) */
export function stripLeadingH2(md: string): string {
  return md.replace(/^\s*##\s+[^\n]*\n*/, '').trim()
}

/** sentinel 段按 H2 拆成子板块;首个 H2 前的内容并入第一块,未识别 H2 归入 fallbackKey */
function splitH2Sections(md: string, h2Keys: Record<string, string>, fallbackKey: string): Section[] {
  const chunks = md
    .split(/(?=^## )/m)
    .map((c) => c.trim())
    .filter(Boolean)
  if (!chunks.length) return []
  if (!chunks.some((c) => H2_RE.test(c.split('\n')[0]))) {
    return [{ key: fallbackKey, title: SECTION_TITLE_FALLBACK[fallbackKey], markdown: md.trim() }]
  }

  const sections: Section[] = []
  let preamble = ''
  for (const chunk of chunks) {
    const firstLine = chunk.split('\n')[0]
    const h2 = H2_RE.exec(firstLine)
    if (!h2) {
      preamble += chunk + '\n\n'
      continue
    }
    const body = (preamble + chunk).trim()
    preamble = ''
    const title = h2[1].trim()
    sections.push({ key: h2Keys[title] ?? fallbackKey, title, markdown: body })
  }
  if (preamble.trim() && sections.length) {
    sections[sections.length - 1].markdown += '\n\n' + preamble.trim()
  }
  return sections
}

function splitSections(body: string): Section[] {
  const sections: Section[] = []
  for (const key of SECTION_ORDER) {
    let md = extractSection(body, key)
    if (!md.trim()) continue
    if (key === 'rss') {
      // rss 兜底路径会把整篇 body(含残留 frontmatter / 首行 H1)还回来
      ;[, md] = parseFrontmatter(md)
      md = stripLeadingH1(md)
    }
    md = md.trim()
    if (!md) continue
    if (key === 'insights') {
      sections.push(...splitH2Sections(md, INSIGHTS_H2_KEYS, 'insights'))
      continue
    }
    if (key === 'weekly') {
      sections.push(...splitH2Sections(md, WEEKLY_H2_KEYS, 'weekly'))
      continue
    }
    const h2 = H2_RE.exec(md)
    sections.push({ key, title: h2 ? h2[1].trim() : SECTION_TITLE_FALLBACK[key], markdown: md })
  }
  return sections
}

// ─── 报告解析 ───

/** 解析单个 push 文件文本为完整报告;文件名不合规返回 null */
export function parseReport(fileName: string, text: string): ReportDetail | null {
  const id = reportIdFromName(fileName)
  if (!id) return null

  const [meta, body] = parseFrontmatter(text)
  const date = id.slice(0, 10)
  const time = `${id.slice(11, 13)}:${id.slice(14, 16)}`

  let title: string
  let profile: string
  let lead = ''
  let highlights: string[] = []
  let sourceCount: number | null = null
  let totalEntries: number | null = null

  const h1 = H1_RE.exec(body)
  if (Object.keys(meta).length) {
    title = String(meta.title ?? '').trim() || (h1 ? h1[1].trim() : `AI4S 报告 ${date}`)
    profile = String(meta.profile ?? 'default')
    lead = String(meta.lead ?? '')
    highlights = normalizeStrList(meta.highlights)
    sourceCount = typeof meta.sourceCount === 'number' ? meta.sourceCount : null
    totalEntries = typeof meta.totalEntries === 'number' ? meta.totalEntries : null
  } else {
    title = h1 ? h1[1].trim() : `AI4S 报告 ${date}`
    profile = body.includes('<!-- SECTION:') ? 'morning' : 'default'
  }

  return {
    id,
    date,
    time,
    profile,
    title,
    lead,
    highlights,
    sourceCount,
    totalEntries,
    sections: splitSections(body),
  }
}
