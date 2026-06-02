import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'watchlist',
      component: () => import('../views/WatchlistView.vue'),
    },
    {
      path: '/company/:id',
      name: 'company',
      component: () => import('../views/ResearchWorkbenchView.vue'),
    },
    {
      path: '/sources',
      name: 'sources',
      component: () => import('../views/SourcesView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router
