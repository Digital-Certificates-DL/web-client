import { defineStore } from 'pinia'
import { UserJSONResponse, UserSetting } from '@/types'

export const useUserStore = defineStore('users-store', {
  state: () => {
    return {
      students: [] as UserJSONResponse[],
      bufferUserList: [] as UserJSONResponse[],
      setting: {} as UserSetting,
    }
  },
  persist: {
    storage: localStorage,
    paths: ['setting'],
  },
  actions: {
    initSettings(userSettings: UserSetting) {
      this.setting = userSettings
    },
  },
})
