import { createRouter, createWebHistory, useRoute, useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/enums'

const routes = [
  {
    path: '/:catchAll(.*)',
    redirect: { name: ROUTE_NAMES.menu },
  },
  {
    path: '/main',
    name: ROUTE_NAMES.menu,
    component: () => import('@/pages/Menu.vue'),
  },
  {
    path: '/create',
    name: ROUTE_NAMES.create,
    component: () => import('@/pages/Generation.vue'),
  },
  {
    path: '/template',
    name: ROUTE_NAMES.template,
    component: () => import('@/pages/Template.vue'),
  },
  {
    path: '/certificates',
    name: ROUTE_NAMES.certificates,
    component: () => import('@/pages/Certificates.vue'),
  },
  {
    path: '/home',
    name: ROUTE_NAMES.home,
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/setting',
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
