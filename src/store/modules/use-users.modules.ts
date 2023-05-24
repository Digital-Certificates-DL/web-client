import { defineStore } from 'pinia'
import { UserJSONResponse, UserSetting } from '@/types'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useUserStore = defineStore('users-store', {
  state: () => {
    return {
      students: [] as UserJSONResponse[],
      setting: {} as UserSetting,
    }
  },
  persist: {
    storage: sessionStorage,
  },
})
