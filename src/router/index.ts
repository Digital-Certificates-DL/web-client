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
    component: () => import('@/pages/MainPage.vue'),
  },
  {
    path: '/generate',
    name: ROUTE_NAMES.generate,
    component: () => import('@/pages/GenerationPage.vue'),
  },
  {
    path: '/home',
    name: ROUTE_NAMES.home,
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/certificates',
    name: ROUTE_NAMES.certificates,
    component: () => import('@/pages/AllCertificatesPage.vue'),
  },
  {
    path: '/templates',
    name: ROUTE_NAMES.templates,
    component: () => import('@/pages/AllTemplatesPage.vue'),
  },
  {
    path: '/settings',
    name: ROUTE_NAMES.settings,
    component: () => import('@/pages/SettingPage.vue'),
  },
  {
    path: '/timestamp',
    name: ROUTE_NAMES.timestamp,
    component: () => import('@/pages/TimestampPage.vue'),
  },
  {
    path: '/template/:name',
    props: true,
    name: ROUTE_NAMES.template,
    component: () => import('@/pages/TemplatePage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 }),
})

export { router, useRouter, useRoute }
