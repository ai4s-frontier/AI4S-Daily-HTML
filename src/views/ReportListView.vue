<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { listReports } from '../api/client'
import type { ReportSummary } from '../types'
import ReportCard from '../components/ReportCard.vue'

const route = useRoute()

// 同一组件承载日报/周报两个归档页,按路由名区分 profile
const profile = computed(() => (route.name === 'list-weekly' ? 'weekly' : 'morning'))

const reports = ref<ReportSummary[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    reports.value = await listReports(profile.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
})

const pageTitle = computed(() =>
  profile.value === 'weekly' ? '每周研判归档' : '每日研判归档',
)
const emptyText = computed(() =>
  profile.value === 'weekly' ? '暂无周报归档' : '暂无日报归档',
)

// 报告日期 → 所在周周一的 yyyy-mm-dd(周一为一周起点)
function weekStart(date: string): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 周报按自然周分组(一行为一周,周内两篇按发布时间从左到右);日报按日期分组
const grouped = computed(() => {
  if (profile.value === 'weekly') {
    const groups: { date: string; weekEnd: string; items: ReportSummary[] }[] = []
    for (const r of reports.value) {
      const start = weekStart(r.date)
      const last = groups[groups.length - 1]
      if (last && last.date === start) {
        last.items.push(r)
      } else {
        const end = new Date(start + 'T00:00:00')
        end.setDate(end.getDate() + 6)
        const ey = end.getFullYear()
        const em = String(end.getMonth() + 1).padStart(2, '0')
        const ed = String(end.getDate()).padStart(2, '0')
        groups.push({ date: start, weekEnd: `${ey}-${em}-${ed}`, items: [r] })
      }
    }
    // 组内按发布时间升序(周四发的在左,周日发的在右)
    for (const g of groups) g.items.reverse()
    return groups
  }
  // 日报:按日期分组(报告本身已按时间倒序)
  const groups: { date: string; weekEnd?: string; items: ReportSummary[] }[] = []
  for (const r of reports.value) {
    const last = groups[groups.length - 1]
    if (last && last.date === r.date) {
      last.items.push(r)
    } else {
      groups.push({ date: r.date, items: [r] })
    }
  }
  return groups
})

function fmtDate(date: string) {
  const [, m, d] = date.split('-')
  return { md: `${Number(m)}月${Number(d)}日`, year: date.slice(0, 4) }
}

// 周区间标题:「8.10 – 8.16」;年份取周一所在年
function fmtWeek(start: string, end: string) {
  const [, sm, sd] = start.split('-')
  const [, em, ed] = end.split('-')
  return {
    range: `${Number(sm)}.${Number(sd)} – ${Number(em)}.${Number(ed)}`,
    year: start.slice(0, 4),
  }
}
</script>

<template>
  <div>
    <h2
      class="mb-8 font-serif text-xl font-bold text-stone-900 dark:text-stone-50"
    >
      {{ pageTitle }}
    </h2>

    <div v-if="loading" class="py-20 text-center text-sm text-stone-400">
      载入中…
    </div>
    <div v-else-if="error" class="py-20 text-center text-sm text-red-500">
      {{ error }}
    </div>
    <div
      v-else-if="!grouped.length"
      class="py-20 text-center text-sm text-stone-400"
    >
      {{ emptyText }}
    </div>

    <div v-else class="space-y-12">
      <section v-for="group in grouped" :key="group.date" class="relative">
        <!-- 日期大标:日报按天,周报按周区间 -->
        <div class="mb-5 flex items-baseline gap-3">
          <template v-if="group.weekEnd">
            <h2 class="font-serif text-3xl font-bold tabular-nums text-stone-900 dark:text-stone-50">
              {{ fmtWeek(group.date, group.weekEnd).range }}
            </h2>
            <span class="text-sm tabular-nums text-stone-400">
              {{ fmtWeek(group.date, group.weekEnd).year }}
            </span>
          </template>
          <template v-else>
            <h2 class="font-serif text-3xl font-bold tabular-nums text-stone-900 dark:text-stone-50">
              {{ fmtDate(group.date).md }}
            </h2>
            <span class="text-sm tabular-nums text-stone-400">
              {{ fmtDate(group.date).year }}
            </span>
          </template>
          <span class="text-xs text-stone-400">
            {{ group.items.length }} 期
          </span>
          <div class="ml-2 flex-1 border-t border-stone-200 dark:border-stone-800" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <ReportCard
            v-for="report in group.items"
            :key="report.id"
            :report="report"
          />
        </div>
      </section>
    </div>
  </div>
</template>
