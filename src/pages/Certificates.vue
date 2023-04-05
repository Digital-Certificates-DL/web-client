<template>
  <div>
    <app-button @click="refresh"/>
    <div v-if="userSetting.students.length === 0">
      <error-message message="empty array" />
    </div>
    <div
      v-for="(item, key) in userSetting.students"
      :value="key"
      :key="item.attributes"
    >
      <certificate :user="item" @openModal="openModal" />
    </div>
  </div>

  <div v-if="isModalActive">
    <modal-info :user="currentUser"></modal-info>
  </div>
</template>

<script lang="ts" setup>
import { useUsersModules } from '@/store/modules/use-users.modules'
import Certificate from '@/common/Certificate.vue'
import {} from '@/composables/use-web3'
import ModalInfo from '@/common/ModalInfo.vue'
import {UserJSONResponse, UserJSONResponseList} from '@/types'
import ErrorMessage from '@/common/ErrorMessage.vue'
import AppButton from "@/common/AppButton.vue";
import {api} from "@/api";

const userSetting = useUsersModules()
let isModalActive: boolean
let currentUser: UserJSONResponse

const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive = state
  currentUser = user
  console.log(user, state)
}
const prepareUserImg = (users: UserJSONResponseList) => {  //todo  move to  helpers
  console.log(users)
  for (const user of users.data) {
    console.log(user)
    user.attributes.Img =
      'data:image/png;base64,' + user.attributes.CertificateImg.toString()
  }
  return users
}

const refresh = async () => {  //todo dont show new users
  const users = await api.post<UserJSONResponseList>(
    '/integrations/ccp/',
    {
      data: {
        url: userSetting.setting.Url,
      },
    },
  )
  console.log(users, ": user")

  userSetting.students = prepareUserImg(users.data).data
}
</script>

<style scoped></style>
