<template>
  <div class="all-certificates-page">
    <h2>{{ $t('all-certificates-page.certificates-title') }}</h2>
    <div class="all-certificates-page__search">
      <div class="all-certificates-page__search-input-wrp">
        <input-field
          v-model="searchData"
          :placeholder="$t('all-certificates-page.certificates-find')"
        />
      </div>

      <div class="all-certificates-page__action-btns">
        <app-button
          class="all-certificates-page__btn"
          color="info"
          size="medium"
          :text="$t('all-certificates-page.certificates-bitcoin-btn-text')"
          @click="makeBitcoinTimestamp"
        />
      </div>
    </div>
    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :certificate="currentCertificate"
    />

    <div class="all-certificates-page__list">
      <div class="all-certificates-page___list-titles">
        <p>
          {{ $t('all-certificates-page.certificates-item-name') }}
        </p>
        <p>
          {{ $t('all-certificates-page.certificates-item-course') }}
        </p>
        <p>
          {{ $t('all-certificates-page.certificates-item-date') }}
        </p>
        <p></p>
      </div>
      <div v-if="!userState.certificates.length">
        <no-data-message
          class="all-certificates-page__no-data"
          :message="$t('all-certificates-page.no-certificate-list')"
        />
      </div>
      <div v-for="item in filteredCertificateList" :key="item.id">
        <certificate
          :certificate="item"
          @open-modal="openCertificateModal"
          @on-select="selectItems"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { CertificateJSONResponse } from '@/types'
import { api } from '@/api'
import { InputField } from '@/fields'
import { ref, computed } from 'vue'
import { Bitcoin } from '@/utils'
import {
  AppButton,
  Certificate,
  CertificateModal,
  NoDataMessage,
} from '@/common'
import {
  ErrorHandler,
  useSearchInTheList,
  usePrepareCertificateImage,
} from '@/helpers'

const userState = useUserStore()

const isCertificateModalShown = ref(false)
const currentCertificate = ref<CertificateJSONResponse>(
  {} as CertificateJSONResponse,
)
const listForTimestamp = ref<CertificateJSONResponse[]>([])
const searchData = ref('')

const filteredCertificateList = computed(() =>
  useSearchInTheList(userState.certificates, searchData.value),
)

const openCertificateModal = (certificate: CertificateJSONResponse) => {
  currentCertificate.value = certificate
  isCertificateModalShown.value = true
}

const selectItems = (
  isSelected: boolean,
  certificate: CertificateJSONResponse,
) => {
  if (isSelected) {
    listForTimestamp.value.push(certificate)
    return
  }

  const index = listForTimestamp.value.indexOf(certificate, 0)
  if (index > -1) {
    listForTimestamp.value.splice(index, 1)
  }
}

const getCertificates = async () => {
  try {
    const { data } = await api.post<CertificateJSONResponse[]>(
      '/integrations/ccp/users/',
      {
        body: {
          data: {
            url: userState.userSetting.urlGoogleSheet,
            name: userState.userSetting.accountName,
          },
        },
      },
    )
    userState.setCertificates(usePrepareCertificateImage(data))
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const makeBitcoinTimestamp = async () => {
  if (!userState.userSetting.keyPathID) {
    userState.userSetting.keyPathID = 0
  }

  const certificates = listForTimestamp
  for (const certificate of certificates.value) {
    const tx = await Bitcoin.prepareLegacyTXTestnet(
      userState.userSetting.bip39MnemonicPhrase,
      userState.userSetting.keyPathID,
    )
    if (!tx?.hex) {
      throw new Error()
    }

    // todo  there is react for keyPathID

    const sendResp = await Bitcoin.sendToTestnet(tx?.hex)
    certificate.txHash = sendResp.data.tx.hash
    if (!tx?.exAddress) {
      throw new Error()
    }

    userState.userSetting.lastExAddress = tx?.exAddress
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
          address: userState.userSetting.userBitcoinAddress,
          name: userState.userSetting.accountName,
          url: userState.userSetting.urlGoogleSheet,
        },
      },
    },
  )

  userState.setCertificates(data)
}

const init = () => {
  if (!userState.certificates.length) {
    getCertificates()
  }
}

init()
</script>

<style scoped lang="scss">
.all-certificates-page {
  width: 100%;
  margin: 0 auto;
}

.all-certificates-page__search {
  margin: toRem(24) 0;
  display: flex;
  justify-content: space-between;
  border-radius: toRem(20);
}

.all-certificates-page__search-input-wrp {
  max-width: toRem(458);
  width: 100%;
}

.all-certificates-page__action-btns {
  display: flex;
  justify-content: space-between;
}

.all-certificates-page__no-data {
  margin: 20%;
}

.all-certificates-page__btn {
  height: toRem(52);
  border-radius: toRem(8);
}

.all-certificates-page___list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
