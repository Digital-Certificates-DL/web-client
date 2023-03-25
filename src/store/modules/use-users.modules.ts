import { defineStore } from 'pinia'
import {
  DesignatedProvider,
  UserJSONResponse,
  UserSetting,
  UserTypes,
} from '@/types'

export const useUsersModules = defineStore('users-store', {
  state: () => ({
    students: [] as UserJSONResponse[],
    setting: {} as UserSetting,
    // provider: useProvider(),
  }),
  actions: {
    async addSetting() {},
  },
})
