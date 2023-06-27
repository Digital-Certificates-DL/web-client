<template>
  <div class="previously-certificates-page">
    <h2>{{ $t('previously-certificates-page.certificates-title') }}</h2>
    <div class="previously-certificates-page__search">
      <div class="previously-certificates-page__search-input-wrp">
        <input-field
          v-model="searchInputValue"
          :placeholder="$t('previously-certificates-page.certificates-find')"
          @input="find"
        />
      </div>

      <div class="previously-certificates-page__btns">
        <app-button
          class="previously-certificates-page__btn"
          color="info"
          size="medium"
          :text="$t('previously-certificates-page.certificates-bitcoin-btn')"
          @click="bitcoinTimestamp"
        />
      </div>
    </div>
    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :certificate="currentCertificate"
    />

    <div class="previously-certificates-page__list">
      <div class="previously-certificates-page___list-subtitle">
        <p>
          {{ $t('previously-certificates-page.certificates-subtitle-name') }}
        </p>
        <p>
          {{ $t('previously-certificates-page.certificates-subtitle-course') }}
        </p>
        <p>
          {{ $t('previously-certificates-page.certificates-subtitle-date') }}
        </p>
        <p></p>
      </div>
      <div v-if="!userState.students.length">
        <error-message
          :message="$t('previously-certificates-page.error-certificate-list')"
        />
      </div>
      <div v-for="item in userState.students" :key="item.id">
        <certificate
          :certificate="item"
          @open-modal="openCertificateModal"
          @select="selectForTimestamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { CertificateJSONResponse } from '@/types'
import { api } from '@/api'
import { InputField } from '@/fields'
import { onBeforeMount, ref } from 'vue'
import { Bitcoin } from '@/utils'
import {
  ErrorMessage,
  AppButton,
  Certificate,
  CertificateModal,
} from '@/common'
import { ErrorHandler } from '@/helpers'

const userState = useUserStore()

const isCertificateModalShown = ref(false)
const currentCertificate = ref<CertificateJSONResponse>(
  {} as CertificateJSONResponse,
)
const listForTimestamp = ref<CertificateJSONResponse[]>([])
const certificateBuffer = ref<CertificateJSONResponse[]>([])
const searchInputValue = ref('')

const openCertificateModal = (certificate: CertificateJSONResponse) => {
  isCertificateModalShown.value = true
  currentCertificate.value = certificate
}

const prepareCertificatesImage = (certificates: CertificateJSONResponse[]) => {
  for (const certificate of certificates) {
    if (!certificate.certificateImg) {
      continue
    }
    certificate.img =
      'data:image/png;base64,' + certificate.certificateImg.toString()
  }

  return certificates
}

const selectForTimestamp = (
  state: boolean,
  certificate: CertificateJSONResponse,
) => {
  if (state) {
    listForTimestamp.value.push(certificate)
    return
  }
  listForTimestamp.value.filter(item => item !== certificate)
}

const refresh = async () => {
  try {
    const { data } = await api.post<CertificateJSONResponse[]>(
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
    userState.students = prepareCertificatesImage(data)
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const find = () => {
  certificateBuffer.value = userState.students

  if (searchInputValue.value === '' && certificateBuffer.value) {
    userState.students = certificateBuffer.value
  }
  userState.students.filter(item =>
    item.participant.includes(searchInputValue.value),
  )
}

const bitcoinTimestamp = async () => {
  if (userState.setting.keyPathID === 0 || !userState.setting.keyPathID) {
    userState.setting.keyPathID = 0
  }

  const certificates = listForTimestamp
  for (const certificate of certificates.value) {
    const tx = await Bitcoin.PrepareLegacyTXTestnet(
      userState.setting.bip39MnemonicPhrase,
      userState.setting.keyPathID,
    )
    const hex = tx?.hex || ''
    userState.setting.keyPathID = tx?.index || userState.setting.keyPathID++
    if (hex === '') {
      return
    }
    const sendResp = await Bitcoin.SendToTestnet(hex)
    certificate.txHash = sendResp.data.tx.hash
    userState.setting.lastExAddress = tx?.exAddress || ''
  }
  await updateCertificates(certificates.value)
}

const updateCertificates = async (certificates: CertificateJSONResponse[]) => {
  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/certificate/bitcoin',
    {
      body: {
        data: {
          users: certificates,
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
.previously-certificates-page {
  margin: 0 auto;
  width: toRem(1400);
}

.previously-certificates-page__search {
  margin: toRem(24) 0;
  display: flex;
  justify-content: space-between;
  border-radius: toRem(20);
}

.previously-certificates-page__search-input-wrp {
  width: toRem(458);
}

.previously-certificates-page__btns {
  display: flex;
  justify-content: space-between;
}

.previously-certificates-page__btn {
  height: toRem(52);
  border-radius: toRem(8);
}

.previously-certificates-page___list-subtitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
