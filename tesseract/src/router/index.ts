import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'analyze',
      component: () => import('../views/AnalyzeView.vue'),
    },
    {
      path: '/rules',
      name: 'rules',
      component: () => import('../views/RulesView.vue'),
    },
    {
      path: '/data',
      name: 'data',
      component: () => import('../views/DataView.vue'),
    },
  ],
})

export default router
