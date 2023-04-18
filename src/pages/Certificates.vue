<template>
  <div class="certificates">
    <app-header />

    <h1>Previously certificates</h1>
    <div class="certificates_search">
      <input-field model-value="form.search" @update:model-value="search" />
    </div>
    <div v-if="isModalActive">
      <modal-info @cancel="closeModal" :user="currentUser"  ></modal-info>
    </div>
    <div>
      <app-button @click="refresh" text="Find" />
      <app-button @click="bitcoinTimestamp" text="Bitcoin" />
      <div v-if="userSetting.students.length === 0">
        <error-message message="Empty certificate list" />
      </div>
      <div
        v-for="(item, key) in userSetting.students"
        :value="key"
        :key="item.attributes"
      >
        <certificate
          :user="item"
          @openModal="openModal"
          @selectForTimestamp="selectForTimestamp"
        />
      </div>
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
import {reactive, ref} from 'vue'
// import { Bitcoin } from '@/utils'
import btc from '@/utils/bitcoin.util'
const userSetting = useUsersModules()
const isModalActive = ref(false)
let currentUser: UserJSONResponse

let listForTimestamp: UserJSONResponse[] = []

const form = reactive({
  Search: '',
})
const openModal = (state: boolean, user: UserJSONResponse) => {
  console.log(state, "state")
  console.log(isModalActive)
  isModalActive.value = state
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

const closeModal = () => {
  console.log(isModalActive, "close")
  isModalActive.value = false
}

const selectForTimestamp = (state: boolean,  user:UserJSONResponse) =>{
  console.log("select",  state)
  console.log(user)
  if (state){
    listForTimestamp.push(user)
    console.log(listForTimestamp)
    return
  }

  listForTimestamp.filter(item => item !== user )
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

const bitcoinTimestamp = async () => {
  //todo  implement bitcoin timestamp
  let index = 0
  const users = listForTimestamp
  for (const user of users) {
    const tx = await btc.Bitcoin.PrepareLegacyTXTestnet(userSetting.setting.SendKey, index)
    const  hex = tx?.hex || ""
    index = tx?.index || index++
    console.log(hex)
    if (hex === ""){
      return
    }
    const sendResp =  await btc.Bitcoin.SendToTestnet(hex)
    console.log(sendResp)
  }
}
</script>

<style lang="scss" scoped>

</style>
