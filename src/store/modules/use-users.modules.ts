import { defineStore } from 'pinia'
import { UserJSONResponse, UserSetting } from '@/types'
import { useProvider } from '@/composables'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useUserStore = defineStore('users-store', {
  state: () => {
    return {
      students: [] as UserJSONResponse[],
      bufferUserList: [] as UserJSONResponse[],
      setting: {} as UserSetting,
      provider: useProvider(),
    }
  },
  persist: {
    storage: sessionStorage,
    paths: ['userState'],
  },
})
