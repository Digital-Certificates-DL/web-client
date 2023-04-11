import { acceptHMRUpdate, defineStore } from 'pinia'
import { UserJSONResponse, UserSetting } from '@/types'
import { useProvider } from "@/composables";

export const useUsersModules = defineStore('users-store', {
  state: () => ({
    students: [] as UserJSONResponse[],
    setting: {} as UserSetting,
    provider: useProvider(),
  }),
  actions: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersModules, import.meta.hot))
}
