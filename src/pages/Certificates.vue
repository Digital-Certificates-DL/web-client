<template>
  <div class="certificates">
    <h2>{{ $t('certificates.certificates-title') }}</h2>
    <div class="certificates__search-wrp">
      <div class="certificates__search-input-wrp">
        <input-field
          class="certificates__search-input"
          placeholder="find"
          v-model="form.search"
          @update:model-value="find"
        />
      </div>
      <div class="certificates__btns">
        <app-button
          class="certificates__btn"
          :size="'medium'"
          :color="'info'"
          @click="bitcoinTimestamp"
          :text="$t('certificates.certificates-bitcoin-btn')"
        />
      </div>
    </div>
    <modal-info v-model:is-shown="isModalActive" :user="currentUser" />

    <div class="certificates__list">
      <div class="certificates__list-titles">
        <p>{{ $t('certificates.certificates-subtitle-name') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-course') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-date') }}</p>
      </div>
      <div v-if="userState.students.length === 0">
        <error-message :message="$t('certificates.error-certificate-list')" />
      </div>
      <div v-for="(item, key) in userState.students" :value="key" :key="item">
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
import { UserJSONResponse } from '@/types'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import btc from '@/utils/bitcoin.util'
import { ErrorMessage, AppButton, Certificate } from '@/common'

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
const prepareUserImg = (users: UserJSONResponse[]) => {
  for (const user of users) {
    if (user.CertificateImg === null) {
      continue
    }
    user.Img = 'data:image/png;base64,' + user.CertificateImg.toString()
  }

  return users
}

const selectForTimestamp = (state: boolean, user: UserJSONResponse) => {
  if (state) {
    listForTimestamp.push(user)

    return
  }
  listForTimestamp.filter(item => item !== user)
}

const refresh = async () => {
  const { data } = await api.post<UserJSONResponse[]>(
    '/integrations/ccp/users/',
    {
      body: {
        data: {
          url: userState.setting.url,
          name: userState.setting.name,
        },
      },
    },
  )
  userState.students = prepareUserImg(data)
}

const find = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item => item.Participant.includes(form.search))
}

const bitcoinTimestamp = async () => {
  if (
    userState.setting.keyPathID === 0 ||
    userState.setting.keyPathID === undefined
  ) {
    userState.setting.keyPathID = 0
  }
  const users = listForTimestamp
  for (const user of users) {
    const tx = await btc.Bitcoin.PrepareLegacyTXTestnet(
      userState.setting.sendMnemonicPhrase,
      userState.setting.keyPathID,
    )
    const hex = tx?.hex || ''
    userState.setting.keyPathID = tx?.index || userState.setting.keyPathID++
    if (hex === '') {
      return
    }
    const sendResp = await btc.Bitcoin.SendToTestnet(hex)
    user.TxHash = sendResp.data.tx.hash
    userState.setting.lastExAddress = tx?.exAddress || ''
  }
  await updateUsers(users)
}

const updateUsers = async (users: UserJSONResponse[]) => {
  const { data } = await api.post<UserJSONResponse[]>(
    '/integrations/ccp/certificate/bitcoin',
    {
      body: {
        data: {
          users: users,
          address: userState.setting.address,
          name: userState.setting.name,
          url: userState.setting.url,
        },
      },
    },
  )

  userState.students = data
}

const autoRefresh = () => {
  if (userState.students.length === 0) {
    refresh()
  }
}

autoRefresh()
</script>

<style scoped lang="scss">
.certificates {
  margin: 0 auto;
  width: toRem(1400);
}

.certificates__search-wrp {
  margin-top: toRem(24);
  display: flex;
  justify-content: space-between;
  border-radius: toRem(20);
}

.certificates__search-input-wrp {
  margin-bottom: toRem(20);
  width: toRem(458);
}

.certificates__btns {
  display: flex;
  justify-content: space-between;
}

.certificates__btn {
  height: toRem(52);
  border-radius: toRem(8);
}

.certificates__list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
