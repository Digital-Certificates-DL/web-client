<template>
  <div class="timestamp">
    <app-header />

    <h1>{{ certificatesTitle }}</h1>
    <div class="certificates__search">
      <input-field
        class="timestamp__search-input"
        placeholder="find"
        v-model="form.search"
        @update:model-value="search"
      />
      <div class="timestamp__btns">
        <app-button class="timestamp__btn" @click="find" text="Find" />

        <app-button
          class="timestamp__btn"
          @click="bitcoinTimestamp"
          text="Bitcoin"
        />
      </div>
    </div>

    <div class="timestamp__list">
      <div v-if="userState.students.length === 0">
        <error-message message="Empty certificate list" />
      </div>
      <div v-for="(item, key) in users" :value="key" :key="item">
        <timestemp-item
          :name="item.attributes.Participant"
          :date="item.attributes.Date"
        />
      </div>
    </div>
    <div class="timestamp__img-wrp">
      <img :src="currentUser.attributes.Img" alt="Certificate preview" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
import ErrorMessage from '@/common/ErrorMessage.vue'
import AppButton from '@/common/AppButton.vue'
import { api } from '@/api'
import AppHeader from '@/common/AppHeader.vue'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import btc from '@/utils/bitcoin.util'

import TimestempItem from '@/common/TimestempItem.vue'
const userState = useUserStore()

let currentUser: UserJSONResponse

const listForTimestamp: UserJSONResponse[] = []

const certificatesTitle = 'Previously certificates'
const listForCreate: UserJSONResponse[] = []

const form = reactive({
  search: '',
})

const users = ref([] as UserJSONResponse[])

let userBuffer
const search = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item =>
    item.attributes.Participant.includes(form.search),
  )
}

const prepareUserImg = (users: UserJSONResponseList) => {
  const list: UserJSONResponse[] = users.data
  for (const user of list) {
    user.attributes.Img =
      'data:image/png;base64,' + user.attributes.CertificateImg.toString()
  }

  return users.data
}

const bitcoinTimestamp = async () => {
  if (
    userState.setting.KeyPathID === 0 ||
    userState.setting.KeyPathID === undefined
  ) {
    userState.setting.KeyPathID = 0
  }
  const users = listForTimestamp
  for (const user of users) {
    const tx = await btc.Bitcoin.PrepareLegacyTXTestnet(
      userState.setting.SendMnemonicPhrase,
      userState.setting.KeyPathID,
    )
    const hex = tx?.hex || ''
    userState.setting.KeyPathID = tx?.index || userState.setting.KeyPathID++
    if (hex === '') {
      return
    }
    const sendResp = await btc.Bitcoin.SendToTestnet(hex)
    user.attributes.TxHash = sendResp.data.tx.hash
    userState.setting.LastExAddress = tx?.exAddress || ''
  }
  await updateUsers(users)
}

const updateUsers = async (users: UserJSONResponse[]) => {
  //todo chack it
  const usersResp = await api.post<UserJSONResponseList>(
    '/integrations/ccp/certificate/',
    {
      body: {
        data: {
          data: users,
          address: userState.setting.Address,
          name: userState.setting.Name,
          url: userState.setting.Url,
        },
      },
    },
  )

  userState.students = prepareUserImg(usersResp.data)
}

// const selectForTimestamp = (state: boolean, user: UserJSONResponse) => {
//   if (state) {
//     listForCreate.push(user)
//     return
//   }
//
//   listForCreate.filter(item => item !== user)
// }
</script>

<style lang="scss" scoped></style>
