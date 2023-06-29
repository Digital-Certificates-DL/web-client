import { defineStore } from 'pinia'
import { CertificateJSONResponse, UserSetting } from '@/types'

export const useUserStore = defineStore('users-store', {
  state: () => {
    return {
      bufferCertificateList: [] as CertificateJSONResponse[],
      students: [] as CertificateJSONResponse[],
      setting: {} as UserSetting,
    }
  },
})
