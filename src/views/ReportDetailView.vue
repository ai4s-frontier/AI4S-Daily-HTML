<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getReport } from '../api/client'
import { profileBadgeClass, profileLabel } from '../sections'
import type { ReportDetail } from '../types'
import MarkdownBody from '../components/MarkdownBody.vue'
import SectionNav from '../components/SectionNav.vue'

const props = defineProps<{ id: string }>()

const report = ref<ReportDetail | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    report.value = await getReport(props.id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
})

// 周报详情返回周报归档,其余返回日报归档
const archivePath = computed(() =>
  report.value?.profile === 'weekly' ? '/archive-weekly' : '/archive',
)

function fmtDate(r: ReportDetail) {
  const [y, m, d] = r.date.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}
</script>

<template>
  <div>
    <div v-if="loading" class="py-20 text-center text-sm text-stone-400">
      载入中…
    </div>

    <div v-else-if="error" class="py-20 text-center">
      <p class="text-sm text-red-500">{{ error }}</p>
      <router-link :to="archivePath" class="mt-4 inline-block text-sm text-accent hover:underline">
        ← 返回归档列表
      </router-link>
    </div>

    <template v-else-if="report">
      <!-- 报告头 -->
      <header class="mb-10">
        <div class="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
          <router-link :to="archivePath" class="hover:text-accent">← 归档</router-link>
          <span
            class="inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider"
            :class="profileBadgeClass(report.profile)"
          >
            {{ profileLabel(report.profile) }}
          </span>
          <span class="tabular-nums">{{ fmtDate(report) }} {{ report.time }}</span>
          <span v-if="report.totalEntries != null" class="tabular-nums">
            {{ report.totalEntries }} 条 / {{ report.sourceCount }} 源
          </span>
        </div>

        <h2
          class="mt-4 font-serif text-3xl font-bold leading-tight text-stone-900 sm:text-4xl dark:text-stone-50"
        >
          {{ report.title }}
        </h2>

        <div class="mt-8 border-t-2 border-stone-900 dark:border-stone-100" />
        <div class="mt-[3px] border-t border-stone-400 dark:border-stone-600" />
      </header>

      <!-- 正文:左锚点导航 + 右板块内容 -->
      <div class="lg:flex lg:gap-10">
        <aside class="mb-8 shrink-0 lg:mb-0 lg:w-52">
          <div class="lg:sticky lg:top-8">
            <SectionNav :sections="report.sections" />
          </div>
        </aside>

        <div class="min-w-0 flex-1 space-y-14">
          <section
            v-for="(sec, i) in report.sections"
            :id="`sec-${i}`"
            :key="i"
          >
            <MarkdownBody :source="sec.markdown" />
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
