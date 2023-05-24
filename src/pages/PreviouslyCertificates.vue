<template>
  <div class="previously-certificates">
    <h2>{{ $t('previously-certificates.certificates-title') }}</h2>
    <div class="previously-certificates__search-wrp">
      <input-field
        class="previously-certificates__search-input"
        v-model="form.search"
        :placeholder="$t('previously-certificates.certificates-find')"
        @update:model-value="find"
      />

      <div class="previously-certificates__btns">
        <app-button
          class="previously-certificates__btn"
          color="info"
          size="medium"
          @click="bitcoinTimestamp"
          :text="$t('previously-certificates.certificates-bitcoin-btn')"
        />
      </div>
    </div>
    <certificate-modal v-model:is-shown="isModalActive" :user="currentUser" />

    <div class="certificates__list">
      <div class="certificates__list-subtitle">
        <p>{{ $t('certificates.certificates-subtitle-name') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-course') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-date') }}</p>
        <p></p>
      </div>
      <div v-if="!userState.students.length">
        <error-message
          :message="$t('previously-certificates.error-certificate-list')"
        />
      </div>
      <div v-for="(item, key) in userState.students" :value="key" :key="item">
        <certificate
          :user="item"
          @open-modal="openModal"
          @select="selectForTimestamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { UserJSONResponse } from '@/types'
import { api } from '@/api'
import { InputField } from '@/fields'
import { reactive, ref } from 'vue'
import btc from '@/utils/bitcoin.util'
import {
  ErrorMessage,
  AppButton,
  Certificate,
  CertificateModal,
} from '@/common'

const userState = useUserStore()
const isModalActive = ref(false)
const currentUser = ref({} as UserJSONResponse)
const listForTimestamp: UserJSONResponse[] = []

const userBuffer = ref([] as UserJSONResponse[])

const form = reactive({
  //todo v-model
  search: '',
})
const openModal = (user: UserJSONResponse) => {
  isModalActive.value = true
  currentUser.value = user
}

const prepareUserImg = (users: UserJSONResponse[]) => {
  for (const user of users) {
    if (user.certificateImg === null) {
      continue
    }
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
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
          url: userState.setting.urlGoogleSheet,
          name: userState.setting.accountName,
        },
      },
    },
  )
  userState.students = prepareUserImg(data)
}

const find = () => {
  userBuffer.value = userState.students

  if (form.search === '' && userBuffer.value !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item => item.participant.includes(form.search))
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
      userState.setting.bip39MnemonicPhrase,
      userState.setting.keyPathID,
    )
    const hex = tx?.hex || ''
    userState.setting.keyPathID = tx?.index || userState.setting.keyPathID++
    if (hex === '') {
      return
    }
    const sendResp = await btc.Bitcoin.SendToTestnet(hex)
    user.txHash = sendResp.data.tx.hash
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
          address: userState.setting.userBitcoinAddress,
          name: userState.setting.accountName,
          url: userState.setting.urlGoogleSheet,
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
.previously-certificates {
  margin: 0 auto;
  width: toRem(1400);
}

.previously-certificates__search-wrp {
  margin-top: toRem(24);
  display: flex;
  justify-content: space-between;
  border-radius: toRem(20);
}

.previously-certificates__search-input {
  margin-bottom: toRem(20);
  width: toRem(458);
}

.previously-certificates__btns {
  display: flex;
  justify-content: space-between;
}

.previously-certificates__btn {
  height: toRem(52);
  border-radius: toRem(8);
}

.certificates__list-subtitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
