<template>
  <div class="timestamp-page">
    <h2>{{ $t('timestamp-page.page-title') }}</h2>
    <div>
      <div class="timestamp-page__search">
        <div class="timestamp-page__search-input-wrp">
          <input-field
            v-model="searchData"
            class="timestamp-page__search-input"
            :placeholder="$t('timestamp-page.input-placeholder')"
          />
        </div>

        <div v-if="selectedCount > 0" class="timestamp-page__btns">
          <p>{{ selectedCount }}</p>

          <app-button
            class="timestamp-page__btn"
            color="info"
            :text="$t('timestamp-page.bitcoin-btn-text')"
            @click="makeBitcoinTimestamp"
          />
        </div>
      </div>

      <div class="timestamp-page__body">
        <img
          class="timestamp-page__img"
          :alt="t('timestamp-page.certificate-image-alt')"
          :src="currentCertificate.img || 'branding/template.jpg'"
        />

        <div class="timestamp-page__list">
          <div v-if="!certificatesListBuffer.length">
            <no-data-message :message="t('timestamp-page.empty-cert-list')" />
          </div>
          <div v-for="item in certificateFilter" :key="item.id">
            <short-certificate-item
              :name="item.participant"
              :date="item.date"
              :certificate="item"
              :is-show="isShowTimestampCheckbox"
              @select="selectItem"
              @open-modal="openModal"
            />
          </div>
        </div>
      </div>
    </div>

    <success-modal v-model:is-shown="isMintSuccess" :transaction="mintTx" />
    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :certificate="currentCertificate"
      @success="onSuccessMint"
    />
    <loader-modal v-model:is-shown="isLoading" v-model:text="processState" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { CertificateJSONResponse } from '@/types'
import { InputField } from '@/fields'
import { ref, computed } from 'vue'
import { Bitcoin } from '@/utils'
import {
  LoaderModal,
  ShortCertificateItem,
  AppButton,
  CertificateModal,
  NoDataMessage,
  SuccessModal,
} from '@/common'
import {
  ErrorHandler,
  searchInTheList,
  prepareCertificateImage,
  validateContainerState,
} from '@/helpers'
import { useI18n } from 'vue-i18n'
import { UpdateCertificates } from '@/api/api'

const { t } = useI18n()

const isCertificateModalShown = ref(false)
const currentCertificate = ref({} as CertificateJSONResponse)
const selectedCount = ref(0)

const isMintSuccess = ref(false)
const mintTx = ref('')

const userState = useUserStore()

const searchData = ref('')
const isShowTimestampCheckbox = ref(false)
const processState = ref('')
const isLoading = ref(false)

const certificatesListBuffer = ref<CertificateJSONResponse[]>([])
const certificateList = ref<CertificateJSONResponse[]>([])
const selectedItems = ref<CertificateJSONResponse[]>([])

const certificateFilter = computed(() =>
  searchInTheList(certificateList.value, searchData.value),
)

const openModal = (certificate: CertificateJSONResponse) => {
  isCertificateModalShown.value = true
  currentCertificate.value = certificate
}

const makeBitcoinTimestamp = async () => {
  try {
    const bitcoin = new Bitcoin()
    isLoading.value = true

    processState.value = t('timestamp-page.process-state-getting-utxo')
    await bitcoin.initUTXOBip32TestnetBlockstream(
      userState.userSetting.bip39MnemonicPhrase,
      10,
    )
    processState.value = t('timestamp-page.process-state-prepare-tx')
    for (const certificate of selectedItems.value) {
      const tx = await bitcoin.prepareLegacyTxTestnet(
        userState.userSetting.bip39MnemonicPhrase,
      )

      const { data } = await bitcoin.sendToTestnet(tx.hex)
      certificate.txHash = data.tx.hash.toString()
      bitcoin.setNewUTXO(
        tx.exAddress,
        tx.exPath,
        data.tx.hash,
        tx.balance || -1,
      )
    }

    processState.value = t('timestamp-page.process-state-update-certificates')

    certificateList.value =
      (await updateCertificates(selectedItems.value)) || []

    certificateList.value = prepareCertificateImage(certificateList.value)
  } catch (error) {
    ErrorHandler.process(error)
  }
  isLoading.value = false
}

const removeImgCertificates = (certificates: CertificateJSONResponse[]) => {
  for (const certificate of certificates) {
    delete certificate.certificateImg
    certificate.img = ''
  }
  return certificates
}

const updateCertificates = async (certificates: CertificateJSONResponse[]) => {
  try {
    const data = await UpdateCertificates(
      removeImgCertificates(certificates),
      userState.userSetting.userBitcoinAddress,
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
    const container = await validateContainerState(data.container_id)
    return prepareCertificateImage(container.clear_certificate)
  } catch (err) {
    ErrorHandler.process(err)
  }
}

const getCertificates = () => {
  certificateList.value = userState.bufferCertificateList
  certificatesListBuffer.value = certificateList.value
}

const selectItem = (state: boolean, item: CertificateJSONResponse) => {
  if (state) {
    currentCertificate.value = item
    selectedItems.value.push(item)
    selectedCount.value = selectedItems.value.length
    isShowTimestampCheckbox.value = true

    return
  }

  const index = selectedItems.value.indexOf(item, 0)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
  selectedCount.value = selectedItems.value.length
  if (selectedItems.value.length < 1) {
    isShowTimestampCheckbox.value = false

    return
  }

  isShowTimestampCheckbox.value = true
}

const onSuccessMint = (tx: string) => {
  mintTx.value = tx
  isCertificateModalShown.value = false
  isMintSuccess.value = true
}

getCertificates()
</script>

<style lang="scss" scoped>
.timestamp-page {
  width: 100%;
  margin: 0 auto;
}

.timestamp-page__info {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.timestamp-page__img {
  max-width: toRem(600);
  min-width: toRem(210);
  width: 100%;
  border-radius: toRem(16);
  margin: auto;
}

.timestamp-page__list {
  width: 60%;
}

.timestamp-page__body {
  display: grid;
  margin-top: toRem(20);
  grid-template-columns: 3fr 2fr;
  grid-auto-flow: revert;
  direction: ltr;
  gap: toRem(50);

  @include respond-to(tablet) {
    grid-template-columns: 1fr;
    grid-auto-flow: initial;
  }
}

.timestamp-page__search {
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: space-between;
  margin-bottom: toRem(50);
}

.timestamp-page__btns {
  max-width: toRem(200);
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
}

.timestamp-page__search-input-wrp {
  max-width: toRem(450);
  width: 100%;
  margin-top: toRem(15);
}
</style>
