<template>
  <div class="all-certificates-page">
    <h2>{{ $t('all-certificates-page.certificates-title') }}</h2>
    <div class="all-certificates-page__search">
      <div class="all-certificates-page__search-input-wrp">
        <input-field
          v-model="searchData"
          class="all-certificates-page__search-input"
          :placeholder="$t('all-certificates-page.certificates-find')"
        />
      </div>

      <filters
        class="all-certificates-page__filters"
        :list="filteredCertificateList"
        @filer="onFilter"
      />

      <div class="all-certificates-page__btns-wrp">
        <div
          v-if="selectedItems.length > 0"
          class="all-certificates-page__btns"
        >
          <p class="all-certificates__count">
            {{ selectedItems.length }}
          </p>
          <app-button
            class="all-certificates-page__btn"
            color="info"
            :text="$t('all-certificates-page.generate-btn')"
            @click="generate"
          />
          <app-button
            class="all-certificates-page__btn"
            color="info"
            :text="$t('all-certificates-page.bitcoin-btn')"
            @click="moveToTimestampPage"
          />
        </div>
      </div>
    </div>

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
          :is-show="selectedItems.length > 0"
          :certificate="item"
          @open-modal="openCertificateModal"
          @select="selectItems"
        />
      </div>
    </div>
    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :certificate="currentCertificate"
      @success="successMint"
    />
    <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { CertificateJSONResponse } from '@/types'
import { InputField } from '@/fields'
import { ref, computed } from 'vue'
import {
  AppButton,
  Certificate,
  CertificateModal,
  NoDataMessage,
  Filters,
  LoaderModal,
} from '@/common'
import {
  ErrorHandler,
  searchInTheList,
  prepareCertificateImage,
  clearCertificate,
  signCertificateData,
} from '@/helpers'
import { useI18n } from 'vue-i18n'
import { useRouter } from '@/router'
import {
  useCreatePdf,
  useDownloadImage,
  useValidateContainerState,
  getCertificates,
} from '@/api/api'
import { ROUTE_NAMES } from '@/enums'

const userState = useUserStore()

const { t } = useI18n()

const selectedItems = ref<CertificateJSONResponse[]>([])
const certificatesList = ref<CertificateJSONResponse[]>([])
const router = useRouter()

const isCertificateModalShown = ref(false)
const currentCertificate = ref<CertificateJSONResponse>(
  {} as CertificateJSONResponse,
)
const searchData = ref('')

const isLoading = ref(false)
const processState = ref('')
const isMintSuccess = ref(false)
const mintTx = ref('')

const filteredCertificateList = computed(() =>
  searchInTheList(userState.certificates, searchData.value),
)

const openCertificateModal = async (certificate: CertificateJSONResponse) => {
  if (!certificate.certificateImg) {
    const certificateWithImg = ref<CertificateJSONResponse[]>([])
    certificateWithImg.value = (await getCertificateImage(
      certificate,
    )) as CertificateJSONResponse[]

    certificateWithImg.value = prepareCertificateImage(
      certificateWithImg.value!,
    )

    isCertificateModalShown.value = true
    isLoading.value = false
    currentCertificate.value = certificateWithImg.value[0]
    return
  }
  isCertificateModalShown.value = true
  currentCertificate.value = certificate
}

const getCertificateImage = async (certificate: CertificateJSONResponse) => {
  try {
    isLoading.value = true
    processState.value = t('all-certificates-page.process-state-upload-img')
    return await useDownloadImage(
      certificate,
      userState.userSetting.userBitcoinAddress,
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
  } catch (error) {
    ErrorHandler.process(error)
  }

  isLoading.value = false
}

const selectItems = (
  isSelected: boolean,
  certificate: CertificateJSONResponse,
) => {
  if (isSelected) {
    selectedItems.value.push(certificate)
    return
  }

  const index = selectedItems.value.indexOf(certificate, 0)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
}

const generate = async () => {
  try {
    isLoading.value = true
    processState.value = t('all-certificates-page.process-state-validate-data')
    if (!validateItemListGenerate()) {
      isLoading.value = false
      return
    }

    processState.value = t('all-certificates-page.process-state-sign-data')

    const signatures = await signCertificateData(
      selectedItems.value,
      userState.userSetting.signKey,
    )
    processState.value = t('all-certificates-page.process-state-create-pdf')

    const users = await createPDF(signatures)
    processState.value = ''

    isLoading.value = false
    userState.setBufferCertificates(users)

    await router.push({
      name: ROUTE_NAMES.timestamp,
    })
  } catch (error) {
    ErrorHandler.process(t('errors.default'))
  }
}

const validateItemListGenerate = () => {
  for (const item of selectedItems.value) {
    if (Boolean(item.certificate) || Boolean(item.signature)) {
      ErrorHandler.process(
        //todo  localization
        'This student already has certificate, ' + item.participant,
      )
      return false
    }
  }
  return true
}

const validateItemListTimestamp = () => {
  for (const item of selectedItems.value) {
    if (!item.certificate || !item.signature) {
      ErrorHandler.process(
        'This student does not has certificate,' + item.participant,
      )
      return false
    }
  }
  return true
}

const validateContainerState = async (containerID: string) => {
  const data = await useValidateContainerState(containerID)
  if (!data) {
    ErrorHandler.process(t('errors.empty-container'))
    return
  }
  data.clear_certificate = clearCertificate(data.certificates)
  return data
}

const moveToTimestampPage = async () => {
  userState.setBufferCertificates(selectedItems.value)
  if (validateItemListTimestamp()) {
    await router.push({
      name: ROUTE_NAMES.timestamp,
    })
  }
}

const createPDF = async (
  certificates: CertificateJSONResponse[],
): Promise<CertificateJSONResponse[]> => {
  try {
    const data = await useCreatePdf(
      certificates,
      userState.userSetting.userBitcoinAddress,
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
    const container = await validateContainerState(data.container_id)
    if (!container) {
      ErrorHandler.process(t('errors.empty-container'))
      return []
    }

    return prepareCertificateImage(container.clear_certificate)
  } catch (error) {
    ErrorHandler.process(error)
    return []
  }
}
const onFilter = (list: CertificateJSONResponse[]) => {
  /* eslint-disable no-console */

  console.log('list', list)
  certificatesList.value = list
}

const successMint = (tx: string) => {
  mintTx.value = tx
  isMintSuccess.value = true
}

const refreshCertificatesList = async () => {
  userState.setCertificates(
    await getCertificates(
      userState.userSetting.urlGoogleSheet,
      userState.userSetting.accountName,
    ),
  )

  certificatesList.value = userState.certificates
}

refreshCertificatesList()
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
  max-height: toRem(52);
  height: 100%;
  border-radius: toRem(8);
  margin: 0 toRem(10);
}

.all-certificates-page___list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}

.all-certificates-page__btns {
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: space-evenly;
}

.all-certificates-page__filters {
  width: 40%;
}
</style>
