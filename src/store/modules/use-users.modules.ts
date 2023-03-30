import { defineStore } from 'pinia'
import { UserJSONResponse, UserSetting } from '@/types'

export const useUsersModules = defineStore('users-store', {
  state: () => ({
    students: [] as UserJSONResponse[],
    setting: {} as UserSetting,
    // provider: useProvider(),
  }),
  actions: {},
})
