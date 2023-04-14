<template>
  <div class="certificates">
    <app-header />
    <h1>Previously certificates</h1>
    <div class="certificates_search">
      <input-field model-value="form.search" @update:model-value="search" />
    </div>
    <div>
      <app-button @click="refresh" />
      <div v-if="userSetting.students.length === 0">
        <error-message message="Empty certificate list" />
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
  </div>
</template>

<script lang="ts" setup>
import { useUsersModules } from '@/store/modules/use-users.modules'
import Certificate from '@/common/Certificate.vue'
import ModalInfo from '@/common/ModalInfo.vue'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
import ErrorMessage from '@/common/ErrorMessage.vue'
import AppButton from '@/common/AppButton.vue'
import { api } from '@/api'
import AppHeader from '@/common/AppHeader.vue'
import InputField from '@/fields/InputField.vue'
import { reactive } from 'vue'

const userSetting = useUsersModules()
let isModalActive: boolean
let currentUser: UserJSONResponse

const form = reactive({
  Search: '',
})
const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive = state
  currentUser = user
}
const prepareUserImg = (users: UserJSONResponseList) => {
  //todo  move to  helpers
  for (const user of users.data) {
    user.attributes.Img =
      'data:image/png;base64,' + user.attributes.CertificateImg.toString()
  }
  return users
}

const refresh = async () => {
  //todo dont show new users
  const users = await api.post<UserJSONResponseList>('/integrations/ccp/', {
    data: {
      url: userSetting.setting.Url,
    },
  })
  userSetting.students = prepareUserImg(users.data).data
}

let userBuffer
const search = () => {
  userBuffer = userSetting.students

  if (form.Search === '' && userBuffer !== undefined) {
    userSetting.students = userBuffer
  }
  userSetting.students.filter(item =>
    item.attributes.Participant.includes(form.Search),
  )
}
</script>

<style scoped></style>
