import { defineStore } from 'pinia'
import { CertificateJSONResponse, UserSetting } from '@/types'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useUserStore = defineStore('users-store', {
  state: () => {
    return {
      bufferUserList: [] as CertificateJSONResponse[],
      students: [] as CertificateJSONResponse[],
      bufferCertificateList: [] as CertificateJSONResponse[],
      setting: {} as UserSetting,
    }
  },
  persist: {
    storage: sessionStorage,
    paths: ['userState'],
  },
})
