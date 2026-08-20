import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>(
  document.documentElement.classList.contains('dark') ? 'dark' : 'light',
)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
  localStorage.setItem('dnews-theme', theme.value)
})

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  return { theme, toggle }
}
