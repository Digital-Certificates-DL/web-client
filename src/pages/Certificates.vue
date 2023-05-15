<template>
  <div class="certificates">
    <h1>{{ $t('certificates.certificates-title') }}</h1>
    <div class="certificates__search">
      <input-field
        class="certificates__search-input"
        placeholder="find"
        v-model="form.search"
        @update:model-value="search"
      />
      <div class="certificates__btns">
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
      <div class="certificates__list-titles">
        <p>{{ $t('certificates.certificates-subtitle-name') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-course') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-date') }}</p>
      </div>
      <div v-if="userState.students.length === 0">
        <error-message message="Empty certificate list" />
      </div>

      <div
        v-for="(item, key) in userState.students"
        :value="key"
        :key="item.attributes"
      >
        <certificate
          :user="item"
          @open-modal="openModal"
          @select-for-timestamp="selectForTimestamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import ModalInfo from '@/common/modals/CertificateModal.vue'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import btc from '@/utils/bitcoin.util'
import { AppNavbar, ErrorMessage, AppButton, Certificate } from '@/common'

const userState = useUserStore()
const isModalActive = ref(false)
let currentUser: UserJSONResponse
let userBuffer
const listForTimestamp: UserJSONResponse[] = []

const form = reactive({
  search: '',
})
const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser = user
}
const prepareUserImg = (users: UserJSONResponseList) => {
  for (const user of users.data) {
    user.attributes.Img =
      'data:image/png;base64,' + user.attributes.CertificateImg.toString()
  }

  return users
}

const closeModal = () => {
  isModalActive.value = false
}

const selectForTimestamp = (state: boolean, user: UserJSONResponse) => {
  if (state) {
    listForTimestamp.push(user)

    return
  }
  listForTimestamp.filter(item => item !== user)
}

const refresh = async () => {
  const users = await api.post<UserJSONResponseList>(
    '/integrations/ccp/users/',
    {
      body: {
        data: {
          url: userState.setting.Url,
          name: userState.setting.Name,
        },
      },
    },
  )
  userState.students = prepareUserImg(users.data).data
}

const search = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item =>
    item.attributes.Participant.includes(form.search),
  )
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
  const { data } = await api.post<UserJSONResponseList>(
    '/integrations/ccp/certificate/bitcoin',
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

  userState.students = data.data
}

const autoRefresh = () => {
  if (userState.students.length === 0) {
    refresh()
  }
}

autoRefresh()
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
  background: var(--primary-dark);
  width: toRem(100);
}

.certificates__list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
