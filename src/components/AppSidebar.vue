<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DAILY_SECTIONS, WEEKLY_SECTIONS, isWeeklyPath } from '../sections'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()

// 当前处于周报模式(周刊栏目流 / 周报归档)还是日报模式
const weekly = computed(() => isWeeklyPath(route.path))

// 刊头点击回到当前模式的归档页;「周/日」小字切换到另一模式首页
const mastheadTo = computed(() => (weekly.value ? '/archive-weekly' : '/archive'))
const switchTo = computed(() =>
  weekly.value ? '/sections/overview' : '/sections-weekly/weekly_overview',
)
const sections = computed(() => (weekly.value ? WEEKLY_SECTIONS : DAILY_SECTIONS))

function sectionPath(key: string) {
  return `${weekly.value ? '/sections-weekly' : '/sections'}/${key}`
}

// 非栏目页链接(归档)的高亮样式,周报模式用 emerald
function navClass(active: boolean) {
  const base = 'mb-0.5'
  if (active) {
    return weekly.value
      ? `${base} bg-emerald-600/10 font-semibold text-emerald-600 dark:text-emerald-400`
      : `${base} bg-accent/10 font-semibold text-accent`
  }
  return `${base} text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100`
}

// 移动端 pill 高亮样式
function pillClass(active: boolean) {
  if (active) {
    return weekly.value
      ? 'bg-emerald-600/10 font-semibold text-emerald-600 dark:text-emerald-400'
      : 'bg-accent/10 font-semibold text-accent'
  }
  return 'text-stone-500 dark:text-stone-400'
}
</script>

<template>
  <!-- 桌面端:固定左侧边栏 -->
  <aside
    class="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen dark:border-stone-800 dark:bg-stone-900"
  >
    <!-- 刊头:标题 + 周/日 模式切换小字 -->
    <div class="flex items-start justify-between px-6 pb-6 pt-8">
      <router-link :to="mastheadTo" class="block">
        <p
          class="text-[10px] font-medium uppercase tracking-[0.3em]"
          :class="weekly ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent'"
        >
          AI4S Daily
        </p>
        <h1 class="mt-1 font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
          {{ weekly ? '每周研判' : '每日研判' }}
        </h1>
        <div
          class="mt-4 border-t-2"
          :class="weekly ? 'border-emerald-600 dark:border-emerald-400' : 'border-stone-900 dark:border-stone-100'"
        />
        <div class="mt-[2px] border-t border-stone-300 dark:border-stone-700" />
      </router-link>
      <router-link
        :to="switchTo"
        :title="weekly ? '切换到每日研判' : '切换到每周研判'"
        class="mt-1 shrink-0 rounded border px-1.5 py-0.5 text-xs transition-colors"
        :class="
          weekly
            ? 'border-emerald-600/40 text-emerald-600 hover:bg-emerald-600/10 dark:text-emerald-400'
            : 'border-stone-300 text-stone-400 hover:border-accent hover:text-accent dark:border-stone-700'
        "
      >
        {{ weekly ? '日' : '周' }}
      </router-link>
    </div>

    <!-- 栏目导航:随模式切换 -->
    <nav class="flex-1 overflow-y-auto px-3" aria-label="栏目">
      <router-link
        v-for="sec in sections"
        :key="sec.key"
        :to="sectionPath(sec.key)"
        class="mb-0.5 flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors"
        :class="
          $route.path === sectionPath(sec.key)
            ? weekly
              ? 'bg-emerald-600/10 font-semibold text-emerald-600 dark:text-emerald-400'
              : 'bg-accent/10 font-semibold text-accent'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
        "
      >
        <span aria-hidden="true">{{ sec.icon }}</span>
        {{ sec.label }}
      </router-link>

      <div class="mx-3 my-3 border-t border-stone-200 dark:border-stone-800" />

      <router-link
        :to="weekly ? '/archive-weekly' : '/archive'"
        class="mb-0.5 flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors"
        :class="navClass($route.path === (weekly ? '/archive-weekly' : '/archive'))"
      >
        <span aria-hidden="true">{{ weekly ? '📅' : '🗞️' }}</span>
        {{ weekly ? '每周研判归档' : '每日研判归档' }}
      </router-link>
    </nav>

    <div class="border-t border-stone-200 px-6 py-4 dark:border-stone-800">
      <ThemeToggle />
    </div>
  </aside>

  <!-- 移动端:顶部品牌条 + 横向滚动栏目 -->
  <div class="lg:hidden">
    <div
      class="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900"
    >
      <div class="flex items-baseline gap-2">
        <router-link :to="mastheadTo" class="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">
          {{ weekly ? '每周研判' : '每日研判' }}
        </router-link>
        <router-link
          :to="switchTo"
          class="rounded border px-1 text-[11px]"
          :class="
            weekly
              ? 'border-emerald-600/40 text-emerald-600 dark:text-emerald-400'
              : 'border-stone-300 text-stone-400 dark:border-stone-700'
          "
        >
          {{ weekly ? '日' : '周' }}
        </router-link>
      </div>
      <ThemeToggle />
    </div>
    <nav
      class="flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-3 py-2 dark:border-stone-800 dark:bg-stone-900"
      aria-label="栏目"
    >
      <router-link
        v-for="sec in sections"
        :key="sec.key"
        :to="sectionPath(sec.key)"
        class="shrink-0 rounded-full px-3 py-1 text-xs transition-colors"
        :class="pillClass($route.path === sectionPath(sec.key))"
      >
        {{ sec.icon }} {{ sec.short }}
      </router-link>
      <span class="mx-1 shrink-0 self-center border-l border-stone-300 dark:border-stone-700" />
      <router-link
        :to="weekly ? '/archive-weekly' : '/archive'"
        class="shrink-0 rounded-full px-3 py-1 text-xs transition-colors"
        :class="pillClass($route.path === (weekly ? '/archive-weekly' : '/archive'))"
      >
        {{ weekly ? '📅 归档' : '🗞️ 归档' }}
      </router-link>
    </nav>
  </div>
</template>
