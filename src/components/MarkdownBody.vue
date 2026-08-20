<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ source: string }>()

// html:false → 正文中任何 HTML(含 sentinel 注释残留)被转义丢弃,天然 XSS 安全
const md: MarkdownIt = new MarkdownIt({ html: false, linkify: true })

// 外链新窗口打开
const defaultLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')
  return defaultLinkOpen(tokens, idx, options, env, self)
}

const rendered = computed(() => md.render(props.source))
</script>

<template>
  <article class="prose-dnews" v-html="rendered" />
</template>
