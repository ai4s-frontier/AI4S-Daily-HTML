/** 栏目(板块)共享配置:侧边栏导航 / 卡片徽章 / 栏目页标题统一从这里取 */

export interface SectionNavItem {
  key: string
  label: string // 侧边栏全名
  short: string // 卡片徽章短名
  icon: string
}

/** 日报栏目(早报板块) */
export const DAILY_SECTIONS: SectionNavItem[] = [
  { key: 'overview', label: '总览', short: '总览', icon: '📋' },
  { key: 'plateau', label: '"高原"最新洞察', short: '高原', icon: '🌄' },
  { key: 'peak', label: '"高峰"最新洞察', short: '高峰', icon: '⛰️' },
  { key: 'insights', label: '今日洞察(旧)', short: '旧洞察', icon: '💡' },
  { key: 'relevance', label: '与当前01专项工作的相关性', short: '相关性', icon: '🧭' },
  { key: 'gaps', label: '问题发现', short: '问题发现', icon: '🔬' },
  { key: 'rss', label: '今日热点', short: 'Top热点', icon: '📰' },
  { key: 'hackernews', label: 'Hacker News 热议', short: 'HN', icon: '🟧' },
]

/** 周报栏目 */
export const WEEKLY_SECTIONS: SectionNavItem[] = [
  { key: 'weekly_overview', label: '周报总览', short: '周总览', icon: '📋' },
  { key: 'weekly_insights', label: '本周洞察', short: '周洞察', icon: '💡' },
  { key: 'weekly_trends', label: '趋势分析', short: '趋势', icon: '📈' },
  { key: 'weekly_top', label: '本周Top热点', short: '周Top', icon: '🏆' },
]

export const SECTIONS: SectionNavItem[] = [...DAILY_SECTIONS, ...WEEKLY_SECTIONS]

const WEEKLY_KEYS = new Set(WEEKLY_SECTIONS.map((s) => s.key))

/** 栏目 key 是否属于周报(决定栏目流路由前缀 /sections vs /sections-weekly) */
export function isWeeklySection(key: string): boolean {
  return WEEKLY_KEYS.has(key)
}

/** 路径是否处于周报模式(周刊栏目流 / 周报归档页) */
export function isWeeklyPath(path: string): boolean {
  return path.startsWith('/sections-weekly') || path === '/archive-weekly'
}

export const SECTION_SHORT: Record<string, string> = Object.fromEntries(
  SECTIONS.map((s) => [s.key, s.short]),
)

export const SECTION_LABEL: Record<string, string> = Object.fromEntries(
  SECTIONS.map((s) => [s.key, s.label]),
)

/** 报告 profile → 徽章文案 / 样式(日报 accent,周报 emerald,晚报 stone) */
export function profileLabel(profile: string): string {
  if (profile === 'morning') return '日报'
  if (profile === 'weekly') return '周报'
  return '晚报'
}

export function profileBadgeClass(profile: string): string {
  if (profile === 'morning') return 'bg-accent/10 text-accent'
  if (profile === 'weekly')
    return 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400'
  return 'bg-stone-200/60 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
}
