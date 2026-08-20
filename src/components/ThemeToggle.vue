<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="rounded-full border border-stone-300 p-2 text-stone-500 transition-colors hover:border-accent hover:text-accent dark:border-stone-700 dark:text-stone-400"
    :aria-label="theme === 'dark' ? '切换到浅色模式' : '切换到暗色模式'"
    @click="toggle"
  >
    <!-- 太阳 -->
    <svg v-if="theme === 'dark'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <!-- 月亮 -->
    <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  </button>
</template>
