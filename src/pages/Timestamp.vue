<template>
  <div class="certificates">
    <app-header />

    <h1>{{ certificatesTitle }}</h1>
    <div class="certificates__search">
      <input-field
        class="certificates__search-input"
        placeholder="find"
        v-model="form.search"
        @update:model-value="search"
      />
      <div class="certificates__btns">
        <app-button class="certificates__btn" @click="find" text="Find" />

        <app-button
          class="certificates__btn"
          @click="bitcoinTimestamp"
          text="Bitcoin"
        />
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
import ModalInfo from '@/common/modals/ModalInfo.vue'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
import ErrorMessage from '@/common/ErrorMessage.vue'
import AppButton from '@/common/AppButton.vue'
import { api } from '@/api'
import AppHeader from '@/common/AppHeader.vue'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import btc from '@/utils/bitcoin.util'
import { Signature } from '@/utils/signature.utils'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
const userSetting = useUsersModules()
const isModalActive = ref(false)
let currentUser: UserJSONResponse

const listForTimestamp: UserJSONResponse[] = []

const certificatesTitle = 'Previously certificates'
const listForCreate: UserJSONResponse[] = []

const form = reactive({
  search: '',
})
const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser = user
}

const closeModal = () => {
  isModalActive.value = false
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
    userSetting.setting.KeyPathID === 0 ||
    userSetting.setting.KeyPathID === undefined
  ) {
    userSetting.setting.KeyPathID = 0
  }
  const users = listForTimestamp
  for (const user of users) {
    const tx = await btc.Bitcoin.PrepareLegacyTXTestnet(
      userSetting.setting.SendKey,
      userSetting.setting.KeyPathID,
    )
    const hex = tx?.hex || ''
    userSetting.setting.KeyPathID = tx?.index || userSetting.setting.KeyPathID++
    if (hex === '') {
      return
    }
    const sendResp = await btc.Bitcoin.SendToTestnet(hex)
    user.attributes.TxHash = sendResp.data.tx.hash
    userSetting.setting.LastExAddress = tx?.exAddress || ''
  }
  await updateUsers(users)
}

const updateUsers = async (users: UserJSONResponse[]) => {
  const usersResp = await api
    .post<UserJSONResponseList>('/integrations/ccp/certificate/bitcoin', {
      data: {
        data: users,
        address: userSetting.setting.Address,
        name: userSetting.setting.Name,
        url: userSetting.setting.Url,
      },
    })
    .then(resp => {
      return resp
    })

  userSetting.students = prepareUserImg(usersResp.data)
}

const selectForTimestamp = (state: boolean, user: UserJSONResponse) => {
  if (state) {
    listForCreate.push(user)
    return
  }

  listForCreate.filter(item => item !== user)
}
</script>

<style lang="scss" scoped>
.certificates__search {
  width: toRem(458);
  border-radius: toRem(20);
}

.certificates__search-input {
  margin-bottom: toRem(20);
}

.certificates__btns {
  display: flex;
  justify-content: space-between;
}

.certificates__btn {
  background: #0066ff;
  width: toRem(100);
}

//.certificates__list{
//  height:50%
//}
</style>
