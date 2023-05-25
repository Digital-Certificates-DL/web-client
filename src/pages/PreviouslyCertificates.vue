<template>
  <div class="previously-certificates">
    <h2>{{ $t('previously-certificates.certificates-title') }}</h2>
    <div class="previously-certificates__search-wrp">
      <input-field
        class="previously-certificates__search-input"
        v-model="searchInputValue"
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
    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :user="currentUser"
    />

    <div class="certificates__list">
      <div class="certificates__list-subtitle">
        <p>{{ $t('previously-certificates.certificates-subtitle-name') }}</p>
        <p>{{ $t('previously-certificates.certificates-subtitle-course') }}</p>
        <p>{{ $t('previously-certificates.certificates-subtitle-date') }}</p>
        <p></p>
      </div>
      <div v-if="!userState.students.length">
        <error-message
          :message="$t('previously-certificates.error-certificate-list')"
        />
      </div>
      <div v-for="item in userState.students" :key="item.id">
        <certificate
          :user="item"
          @open-modal="openCertificateModal"
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
import { onBeforeMount, ref } from 'vue'
import btc from '@/utils/bitcoin.util'
import {
  ErrorMessage,
  AppButton,
  Certificate,
  CertificateModal,
} from '@/common'
import { ErrorHandler } from '@/helpers'

const userState = useUserStore()

const isCertificateModalShown = ref(false)
const currentUser = ref<UserJSONResponse>({} as UserJSONResponse)
const listForTimestamp = ref<UserJSONResponse[]>([])
const userBuffer = ref<UserJSONResponse[]>([])
const searchInputValue = ref('')

const openCertificateModal = (user: UserJSONResponse) => {
  isCertificateModalShown.value = true
  currentUser.value = user
}

const prepareUsersImage = (users: UserJSONResponse[]) => {
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
    listForTimestamp.value.push(user)

    return
  }
  listForTimestamp.value.filter(item => item !== user)
}

const refresh = async () => {
  try {
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
    userState.students = prepareUsersImage(data)
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const find = () => {
  userBuffer.value = userState.students

  if (searchInputValue.value === '' && userBuffer.value) {
    userState.students = userBuffer.value
  }
  userState.students.filter(item =>
    item.participant.includes(searchInputValue.value),
  )
}

const bitcoinTimestamp = async () => {
  if (userState.setting.keyPathID === 0 || !userState.setting.keyPathID) {
    userState.setting.keyPathID = 0
  }

  const users = listForTimestamp
  for (const user of users.value) {
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
  await updateUsers(users.value)
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

onBeforeMount(autoRefresh)
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
