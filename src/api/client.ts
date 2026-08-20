/** 静态数据层:公开版无后端,直接读取 public/reports/ 下的 push-*.md。
 *
 * - reports/index.json 由 scripts/generate-index.mjs 在构建前生成(仅列文件名)
 * - 全部报告首次访问时并行拉取并在内存中解析缓存(总量约数百 KB)
 * - 对外签名与原 /api 客户端保持一致,视图层无需改动
 */

import { parseReport, reportIdFromName, stripLeadingH2 } from '../lib/parser'
import type { ReportDetail, ReportSummary, SectionEntry } from '../types'

const BASE = import.meta.env.BASE_URL

async function fetchText(path: string): Promise<string> {
  const resp = await fetch(`${BASE}${path}`)
  if (!resp.ok) throw new Error(`请求失败: ${resp.status}`)
  return resp.text()
}

// 全量报告缓存(按 id 倒序);首次调用时拉取 index + 全部 md 并解析
let allReportsPromise: Promise<ReportDetail[]> | null = null

function loadAllReports(): Promise<ReportDetail[]> {
  if (!allReportsPromise) {
    allReportsPromise = (async () => {
      const files: string[] = JSON.parse(await fetchText('reports/index.json'))
      const texts = await Promise.all(
        files.map((name) => fetchText(`reports/${encodeURIComponent(name)}`)),
      )
      const reports: ReportDetail[] = []
      for (let i = 0; i < files.length; i++) {
        const parsed = parseReport(files[i], texts[i])
        if (parsed) reports.push(parsed)
      }
      reports.sort((a, b) => (a.id < b.id ? 1 : -1))
      return reports
    })()
    // 失败时允许重试
    allReportsPromise.catch(() => {
      allReportsPromise = null
    })
  }
  return allReportsPromise
}

export async function listReports(profile?: string): Promise<ReportSummary[]> {
  let reports = await loadAllReports()
  if (profile) reports = reports.filter((r) => r.profile === profile)
  return reports.map((r) => ({
    ...r,
    sections: r.sections.map((s) => s.key),
  }))
}

export async function getReport(id: string): Promise<ReportDetail> {
  if (!/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/.test(id)) throw new Error('报告不存在')
  const reports = await loadAllReports()
  const report = reports.find((r) => r.id === id)
  if (!report) throw new Error('报告不存在')
  return report
}

export async function getSectionStream(
  key: string,
  limit = 30,
  offset = 0,
): Promise<SectionEntry[]> {
  const reports = await loadAllReports()
  const entries: SectionEntry[] = []
  for (const r of reports) {
    for (const sec of r.sections) {
      if (sec.key !== key) continue
      entries.push({
        report_id: r.id,
        date: r.date,
        time: r.time,
        profile: r.profile,
        title: sec.title,
        markdown: stripLeadingH2(sec.markdown),
      })
    }
  }
  return entries.slice(offset, offset + limit)
}

// 供同步脚本/调试使用:保留文件名 → id 的导出
export { reportIdFromName }
