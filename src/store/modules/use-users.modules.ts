import { defineStore } from 'pinia'
import { CertificateJSONResponse, UserSetting } from '@/types'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useUserStore = defineStore('users-store', {
  state: () => {
    return {
      students: [] as CertificateJSONResponse[],
      bufferCertificateList: [] as CertificateJSONResponse[],
      setting: {} as UserSetting,
      bufferImg: '',
    }
  },
  persist: {
    storage: localStorage,
  },
})
