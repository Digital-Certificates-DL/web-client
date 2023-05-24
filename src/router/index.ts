import { createRouter, createWebHistory, useRoute, useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/enums'

const routes = [
  {
    path: '/:catchAll(.*)',
    redirect: { name: ROUTE_NAMES.main },
  },
  {
    path: '/main',
    name: ROUTE_NAMES.main,
    component: () => import('@/pages/Main.vue'),
  },
  {
    path: '/generate',
    name: ROUTE_NAMES.generate,
    component: () => import('@/pages/Generation.vue'),
  },

  {
    path: '/certificates',
    name: ROUTE_NAMES.certificates,
    component: () => import('@/pages/PreviouslyCertificates.vue'),
  },
  {
    path: '/settings',
    name: ROUTE_NAMES.settings,
    component: () => import('@/pages/SettingForm.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 }),
})

export { router, useRouter, useRoute }
