import { createRouter, createWebHistory, useRoute, useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/enums'

const routes = [
  {
    path: '/:catchAll(.*)',
    redirect: { name: ROUTE_NAMES.uiKit },
  },
  {
    path: '/ui-kit',
    name: ROUTE_NAMES.uiKit,
    component: () => import('@/pages/UiKitPage.vue'),
  },
  {
    path: '/complex-form',
    name: ROUTE_NAMES.complexForm,
    component: () => import('@/forms/ComplexForm.vue'),
  },
  {
    path: '/web3',
    name: ROUTE_NAMES.web3,
    component: () => import('@/pages/MintSBT.vue'),
  },
  {
    path: '/pdf',
    name: ROUTE_NAMES.pdf,
    component: () => import('@/pages/PdfView.vue'),
  },
  {
    path: '/main',
    name: ROUTE_NAMES.main,
    component: () => import('@/pages/Main.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 }),
})

export { router, useRouter, useRoute }
