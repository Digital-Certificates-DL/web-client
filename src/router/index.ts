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
    path: '/create',
    name: ROUTE_NAMES.create,
    component: () => import('@/pages/Generation.vue'),
  },

  {
    path: '/certificates',
    name: ROUTE_NAMES.certificates,
    component: () => import('@/pages/Certificates.vue'),
  },
  {
    path: '/settings',
    name: ROUTE_NAMES.setting,
    component: () => import('@/pages/Setting.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 }),
})

export { router, useRouter, useRoute }
