<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>

<template>
  <ul v-if="items.length" class="space-y-2">
    <li
      v-for="(item, i) in items"
      :key="i"
      class="border-l-[3px] border-accent bg-accent/5 py-2 pl-4 pr-3 text-[15px] leading-relaxed text-stone-700 dark:bg-accent/10 dark:text-stone-300"
    >
      {{ item }}
    </li>
  </ul>
</template>
