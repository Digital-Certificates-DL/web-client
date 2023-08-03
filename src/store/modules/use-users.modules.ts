import { defineStore } from 'pinia'
import { CertificateJSONResponse, UserSetting } from '@/types'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useUserStore = defineStore('users-store', {
  state: () => {
    return {
      _certificates: [] as CertificateJSONResponse[],
      _setting: {} as UserSetting,
    }
  },
  persist: {
    storage: localStorage,
  },
  actions: {
    setUserSetting(setting: UserSetting) {
      this._setting = setting
    },
    setCertificates(certificates: CertificateJSONResponse[]) {
      this._certificates = certificates
    },
  },
  getters: {
    certificates: state => state._certificates,
    userSetting: state => state._setting,
  },
})
