<template>
  <div class="certificates">
    <app-header />

    <h1>Previously certificates</h1>
    <div class="certificates__search">
      <input-field  class="certificates__search-input" placeholder="&#128269 find" v-model="form.search" @update:model-value="search" />
      <div class="certificates__btns">
        <app-button class="certificates__btn" @click="find" text="Find" />
        <app-button class="certificates__btn" @click="refresh" text="Refresh" />
        <app-button class="certificates__btn" @click="bitcoinTimestamp" text="Bitcoin" />
      </div>
    </div>
    <div v-if="isModalActive">
      <modal-info @cancel="closeModal" :user="currentUser"></modal-info>
    </div>
    <div class="certificates__list">
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
import { reactive, ref } from 'vue'
import btc from '@/utils/bitcoin.util'
const userSetting = useUsersModules()
const isModalActive = ref(false)
let currentUser: UserJSONResponse

const listForTimestamp: UserJSONResponse[] = []

const form = reactive({
  search: '',
})
const openModal = (state: boolean, user: UserJSONResponse) => {
  console.log(state, 'state')
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
  console.log(isModalActive, 'close')
  isModalActive.value = false
}

const selectForTimestamp = (state: boolean, user: UserJSONResponse) => {
  console.log('select', state)
  console.log(user)
  if (state) {
    listForTimestamp.push(user)
    console.log(listForTimestamp)
    return
  }

  listForTimestamp.filter(item => item !== user)
}

const refresh = async () => {
  //todo dont show new users
  const users = await api.post<UserJSONResponseList>('/integrations/ccp/users/', {
    data: {
      url: userSetting.setting.Url,
      name: userSetting.setting.Name
    },
  })
  userSetting.students = prepareUserImg(users.data).data
}

let userBuffer
const search = () => {
  userBuffer = userSetting.students

  if (form.search === '' && userBuffer !== undefined) {
    userSetting.students = userBuffer
  }
  userSetting.students.filter(item =>
    item.attributes.Participant.includes(form.search),
  )
}

const bitcoinTimestamp = async () => {
  //todo  implement bitcoin timestamp
  if ( userSetting.setting.KeyPathID === 0 || userSetting.setting.KeyPathID === undefined){
    userSetting.setting.KeyPathID = 0
  }
  const users = listForTimestamp
  for (const user of users) {
    console.log(user)
    const tx = await btc.Bitcoin.PrepareLegacyTXTestnet(
      userSetting.setting.SendKey,
      userSetting.setting.KeyPathID,
    )
    const hex = tx?.hex || ''
    userSetting.setting.KeyPathID = tx?.index || userSetting.setting.KeyPathID++
    console.log(hex)
    if (hex === '') {
      return
    }
    const sendResp = await btc.Bitcoin.SendToTestnet(hex)
    user.attributes.TxHash  = sendResp.data.tx.hash
    console.log("**response: ",sendResp)
    userSetting.setting.LastExAddress = tx?.exAddress || ''
  }
  await updateUsers(users)
}

const updateUsers = async (users: UserJSONResponse[]) =>{
  await api
    .post<UserJSONResponseList>('/integrations/ccp/certificate/bitcoin', {
      data: {
        data: users,
        address: userSetting.setting.Address,
        name: userSetting.setting.Name,
        url: userSetting.setting.Url
      },
    })
    .then(resp => {
      console.log("update table resp: ",  resp)
      const users = prepareUserImg(resp.data)
      userSetting.students = users.data
      // router.push(ROUTE_NAMES.certificates)
    })
}

</script>

<style lang="scss" scoped>
.certificates__search{
  width: toRem(458);
  border-radius: toRem(20);

}

.certificates__search-input{
  margin-bottom: toRem(20);
}

.certificates__btns{
  display: flex;
  justify-content: space-between;
}

.certificates__btn{
  background: #0066FF;
  width: toRem(100);
}

//.certificates__list{
//  height:50%
//}
</style>
