<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getSectionStream } from '../api/client'
import { SECTION_LABEL, profileBadgeClass, profileLabel } from '../sections'
import type { SectionEntry } from '../types'
import MarkdownBody from '../components/MarkdownBody.vue'

const props = defineProps<{ sectionKey: string }>()

const PAGE = 30
const entries = ref<SectionEntry[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const exhausted = ref(false)
const error = ref('')

const label = computed(() => SECTION_LABEL[props.sectionKey] ?? props.sectionKey)

async function load(offset: number) {
  const chunk = await getSectionStream(props.sectionKey, PAGE, offset)
  if (chunk.length < PAGE) exhausted.value = true
  return chunk
}

async function reload() {
  loading.value = true
  error.value = ''
  entries.value = []
  exhausted.value = false
  try {
    entries.value = await load(0)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  try {
    entries.value = entries.value.concat(await load(entries.value.length))
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loadingMore.value = false
  }
}

// 同一路由组件在栏目间切换时复用,监听 key 变化重新加载
watch(() => props.sectionKey, reload, { immediate: true })

// 按日期分组(条目已按时间倒序)
const grouped = computed(() => {
  const groups: { date: string; items: SectionEntry[] }[] = []
  for (const e of entries.value) {
    const last = groups[groups.length - 1]
    if (last && last.date === e.date) {
      last.items.push(e)
    } else {
      groups.push({ date: e.date, items: [e] })
    }
  }
  return groups
})

function fmtDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}
</script>

<template>
  <div>
    <!-- 栏目标题 -->
    <header class="mb-8">
      <h2 class="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">
        {{ label }}
      </h2>
      <div class="mt-4 border-t-2 border-stone-900 dark:border-stone-100" />
      <div class="mt-[3px] border-t border-stone-400 dark:border-stone-600" />
    </header>

    <div v-if="loading" class="py-20 text-center text-sm text-stone-400">载入中…</div>
    <div v-else-if="error" class="py-20 text-center text-sm text-red-500">{{ error }}</div>
    <div v-else-if="!grouped.length" class="py-20 text-center text-sm text-stone-400">
      该栏目暂无内容
    </div>

    <template v-else>
      <section v-for="group in grouped" :key="group.date" class="mb-12">
        <!-- 日期分隔 -->
        <div class="mb-5 flex items-baseline gap-3">
          <h3 class="font-serif text-xl font-bold tabular-nums text-stone-800 dark:text-stone-100">
            {{ fmtDate(group.date) }}
          </h3>
          <div class="flex-1 border-t border-stone-200 dark:border-stone-800" />
        </div>

        <div class="space-y-8">
          <article
            v-for="entry in group.items"
            :key="entry.report_id"
            class="border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900"
          >
            <div class="mb-4 flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
              <span
                class="inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider"
                :class="profileBadgeClass(entry.profile)"
              >
                {{ profileLabel(entry.profile) }}
              </span>
              <span class="tabular-nums">{{ entry.time }}</span>
              <router-link
                :to="`/report/${entry.report_id}`"
                class="ml-auto text-accent hover:underline"
              >
                查看完整报告 →
              </router-link>
            </div>
            <MarkdownBody :source="entry.markdown" />
          </article>
        </div>
      </section>

      <div v-if="!exhausted" class="py-6 text-center">
        <button
          type="button"
          class="border border-stone-300 px-6 py-2 text-sm text-stone-500 transition-colors hover:border-accent hover:text-accent dark:border-stone-700 dark:text-stone-400"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? '载入中…' : '加载更早的内容' }}
        </button>
      </div>
    </template>
  </div>
</template>
