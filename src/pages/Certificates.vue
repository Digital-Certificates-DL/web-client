<template>
  <div>
    <div v-if="userSetting.students.length == 0">
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
    <p>test</p>
    <p>test</p>

    <modal-info :user="currentUser"></modal-info>
  </div>
</template>

<script lang="ts" setup>
import { useUsersModules } from '@/store/modules/use-users.modules'
import Certificate from '@/common/Certificate.vue'
import {} from '@/composables/use-web3'
import ModalInfo from '@/common/ModalInfo.vue'
import { UserJSONResponse } from '@/types'
import ErrorMessage from '@/common/ErrorMessage.vue'

const userSetting = useUsersModules()
let isModalActive: boolean
let currentUser: UserJSONResponse

const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive = state
  currentUser = user
  console.log(user, state)
}
</script>

<style scoped></style>
