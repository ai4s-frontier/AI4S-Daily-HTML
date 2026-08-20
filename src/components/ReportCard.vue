<script setup lang="ts">
import { SECTION_SHORT, profileBadgeClass, profileLabel } from '../sections'
import type { ReportSummary } from '../types'

defineProps<{ report: ReportSummary }>()
</script>

<template>
  <router-link
    :to="`/report/${report.id}`"
    class="group block border border-stone-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg hover:shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900 dark:hover:shadow-black/30"
  >
    <div class="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
      <span
        class="inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider"
        :class="profileBadgeClass(report.profile)"
      >
        {{ profileLabel(report.profile) }}
      </span>
      <span class="tabular-nums">{{ report.time }}</span>
      <span
        v-if="report.totalEntries != null"
        class="ml-auto tabular-nums"
      >
        {{ report.totalEntries }} 条 / {{ report.sourceCount }} 源
      </span>
    </div>

    <h3
      class="mt-3 font-serif text-lg font-bold leading-snug text-stone-900 group-hover:text-accent dark:text-stone-50"
    >
      {{ report.title }}
    </h3>

    <p
      v-if="report.lead"
      class="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400"
    >
      {{ report.lead }}
    </p>

    <div class="mt-4 flex flex-wrap gap-1.5">
      <span
        v-for="key in report.sections"
        :key="key"
        class="border border-stone-200 px-1.5 py-0.5 text-[11px] text-stone-400 dark:border-stone-700 dark:text-stone-500"
      >
        {{ SECTION_SHORT[key] ?? key }}
      </span>
    </div>
  </router-link>
</template>
