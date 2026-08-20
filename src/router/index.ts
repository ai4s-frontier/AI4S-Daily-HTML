import { createRouter, createWebHashHistory } from 'vue-router'
import SectionStreamView from '../views/SectionStreamView.vue'
import ReportListView from '../views/ReportListView.vue'
import ReportDetailView from '../views/ReportDetailView.vue'
import { isWeeklySection } from '../sections'

// 公开版托管于 GitHub Pages(纯静态、无 SPA fallback),使用 hash 路由避免刷新 404
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/sections/overview' },
    {
      path: '/sections/:key',
      name: 'section',
      component: SectionStreamView,
      // key 是 Vue 保留属性名,不能作为 prop 传递,映射为 sectionKey
      props: (route) => ({ sectionKey: route.params.key }),
    },
    {
      path: '/sections-weekly/:key',
      name: 'section-weekly',
      component: SectionStreamView,
      props: (route) => ({ sectionKey: route.params.key }),
    },
    {
      path: '/archive',
      name: 'list',
      component: ReportListView,
    },
    {
      path: '/archive-weekly',
      name: 'list-weekly',
      component: ReportListView,
    },
    { path: '/report/:id', name: 'detail', component: ReportDetailView, props: true },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// 栏目与路径前缀不匹配时重定向到正确前缀(weekly 栏目 ↔ /sections-weekly)
router.beforeEach((to) => {
  if (to.name === 'section' && isWeeklySection(String(to.params.key))) {
    return { name: 'section-weekly', params: to.params }
  }
  if (to.name === 'section-weekly' && !isWeeklySection(String(to.params.key))) {
    return { name: 'section', params: to.params }
  }
})
