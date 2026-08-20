<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Section } from '../types'

const props = defineProps<{ sections: Section[] }>()

const activeIdx = ref(0)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeIdx.value = Number(entry.target.id.replace('sec-', ''))
        }
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  )
  props.sections.forEach((_sec, i) => {
    const el = document.getElementById(`sec-${i}`)
    if (el) observer!.observe(el)
  })
})

onBeforeUnmount(() => observer?.disconnect())

function scrollTo(idx: number) {
  document.getElementById(`sec-${idx}`)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <nav aria-label="板块导航">
    <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
      本期板块
    </p>
    <ul class="space-y-1 border-l border-stone-200 dark:border-stone-800">
      <li v-for="(sec, i) in sections" :key="i">
        <button
          type="button"
          class="-ml-px block w-full border-l-2 py-1.5 pl-4 text-left text-sm transition-colors"
          :class="
            activeIdx === i
              ? 'border-accent font-semibold text-accent'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          "
          @click="scrollTo(i)"
        >
          {{ sec.title }}
        </button>
      </li>
    </ul>
  </nav>
</template>
