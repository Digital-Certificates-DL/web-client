<template>
  <div class="all-certificates-page">
    <h2>{{ $t('all-certificates-page.certificates-title') }}</h2>
    <div class="all-certificates-page__search-wrp">
      <div class="all-certificates-page__search">
        <input-field
          v-model="searchData"
          :placeholder="$t('all-certificates-page.certificates-find')"
        />
      </div>

      <div class="all-certificates-page__filters">
        <app-dropdown
          :items="DROP_DOWN_COURSE_LIST"
          @select-item="filteringByCourseWrapper"
        />
        <app-dropdown
          :title="'Data'"
          :items="DROP_DOWN_DATA_LIST"
          :main-image="'/branding/data-ico.png'"
        />
        <app-dropdown
          :title="'All'"
          :items="DROP_DOWN_STATE_LIST"
          :main-image="'/branding/success-ico.png'"
          @select-item="filteringByStateWrapper"
        />
      </div>

      <div class="all-certificates-page__btns-wrp">
        <div v-if="selectedCount > 0" class="all-certificates-page__btns">
          <p class="all-certificates__count">
            {{ selectedCount }}
          </p>
          <app-button
            class="all-certificates-page__btn"
            color="info"
            :text="$t('all-certificates-page.generate-btn')"
            @click="issueCertificates"
          />
          <app-button
            class="all-certificates-page__btn"
            color="info"
            :text="$t('all-certificates-page.bitcoin-btn')"
            @click="moveToTimestamp"
          />
        </div>
      </div>
    </div>

    <div class="all-certificates-page__list">
      <div class="all-certificates-page__list-subtitle">
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

      <no-data-message
        v-if="!userState.certificates.length"
        class="all-certificates-page__no-data-message"
        :message="$t('errors.empty-cert-list')"
      />

      <div v-for="item in certificateFilter" :key="item.id">
        <certificate
          :is-show="selectedItems.length > 0"
          :certificate="item"
          @open-modal="openCertificateModal"
          @select="selectItem"
        />
      </div>
    </div>

    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :certificate="currentCertificate"
      @success="onSuccessMint"
    />
    <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />
    <success-modal v-model:is-shown="isMintSuccess" :transaction="mintTx" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { CertificateJSONResponse, DropdownItem } from '@/types'
import { InputField } from '@/fields'
import { ref, computed } from 'vue'
import { useRouter } from '@/router'

import {
  AppButton,
  AppDropdown,
  Certificate,
  CertificateModal,
  NoDataMessage,
  SuccessModal,
  LoaderModal,
} from '@/common'
import {
  prepareCertificateImage,
  validateContainerState,
  ErrorHandler,
  searchInTheList,
  signCertificateData,
  validateItemListTimestamp,
  validateItemListGenerate,
  filteringByCourse,
  filteringByState,
} from '@/helpers'
import { ROUTE_NAMES } from '@/enums'
import {
  useCreatePdf,
  useDownloadImage,
  useUploadCertificates,
} from '@/api/api'
import { useI18n } from 'vue-i18n'
import {
  DROP_DOWN_COURSE_LIST,
  DROP_DOWN_DATA_LIST,
  DROP_DOWN_STATE_LIST,
} from '@/constant'
const { t } = useI18n()

const userState = useUserStore()

const isCertificateModalShown = ref(false)
const currentCertificate = ref<CertificateJSONResponse>(
  {} as CertificateJSONResponse,
)
const selectedItems = ref<CertificateJSONResponse[]>([])
const certificatesList = ref<CertificateJSONResponse[]>([])
const searchData = ref('')
const selectedCount = ref(0)

const router = useRouter()

const isLoading = ref(false)
const processState = ref('')
const isMintSuccess = ref(false)
const mintTx = ref('')

const certificateFilter = computed(() =>
  searchInTheList(certificatesList.value, searchData.value),
)

const openCertificateModal = async (certificate: CertificateJSONResponse) => {
  try {
    if (!certificate.certificateImg) {
      const certificateWithImg = ref<CertificateJSONResponse[]>([])
      certificateWithImg.value = (await getCertificateImage(
        certificate,
      )) as CertificateJSONResponse[]

      certificateWithImg.value = prepareCertificateImage(
        certificateWithImg.value!,
      )

      currentCertificate.value = certificateWithImg.value[0]
      isCertificateModalShown.value = true
      isLoading.value = false

      return
    }
    isCertificateModalShown.value = true
    currentCertificate.value = certificate
  } catch (error) {
    ErrorHandler.process(t('error.default'))
  }
}

const selectItem = (state: boolean, item: CertificateJSONResponse) => {
  if (state) {
    selectedItems.value.push(item)
    selectedCount.value++
    return
  }

  const index = selectedItems.value.indexOf(item, 0)
  if (index > -1) {
    selectedCount.value--
    selectedItems.value.splice(index, 1)
  }
}

const getCertificateImage = async (certificate: CertificateJSONResponse) => {
  try {
    isLoading.value = true
    processState.value = t('all-certificate-page.image_uploading')
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

const getCertificates = async () => {
  try {
    isLoading.value = true
    processState.value = t('all-certificates-page.process-state-update-date')
    const data = await useUploadCertificates(
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )

    userState.setCertificates(prepareCertificateImage(data))
    certificatesList.value = userState.certificates
  } catch (error) {
    ErrorHandler.process(t('errors.failed-get-certificates'))
  }
  isLoading.value = false
}

// TODO  make  it better

const filteringByCourseWrapper = (filter: DropdownItem) => {
  certificatesList.value = filteringByCourse(
    certificateFilter.value,
    userState.certificates,
    filter.text,
  )
}

// TODO  make  it better

const filteringByStateWrapper = (filter: DropdownItem) => {
  certificatesList.value = filteringByState(
    certificateFilter.value,
    userState.certificates,
    filter.text,
  )
}

const moveToTimestamp = async () => {
  userState.setBufferCertificates(selectedItems.value)
  if (validateItemListTimestamp(selectedItems.value)) {
    await router.push({
      name: ROUTE_NAMES.timestamp,
    })
  }
  ErrorHandler.process(t('errors.certificate-has-timestamp'))
}

const issueCertificates = async () => {
  isLoading.value = true
  processState.value = t('all-certificates-page.process-state-validate-data')
  if (!validateItemListGenerate(selectedItems.value)) {
    isLoading.value = false
    ErrorHandler.process(t('errors.certificate-was-generated'))
    return
  }

  processState.value = t('all-certificates-page.process-state-sign-data')

  const signatures = await signCertificateData(
    selectedItems.value,
    userState.userSetting.signKey,
  )

  processState.value = t('all-certificates-page.process-state-create-pdf')
  const certificates = await generatePDF(signatures)
  if (!certificates) {
    ErrorHandler.process('errors.no-certificate-list"')
    return
  }
  userState.setBufferCertificates(certificates)
  processState.value = ''

  isLoading.value = false
  await router.push({
    name: ROUTE_NAMES.timestamp,
  })
}

const generatePDF = async (certificates: CertificateJSONResponse[]) => {
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
      return
    }

    userState.setCertificates(
      prepareCertificateImage(container.clear_certificate),
    )
    return userState.certificates
  } catch (error) {
    ErrorHandler.process(t('errors.failed-generate-certificates'))
    return
  }
}

const onSuccessMint = (tx: string) => {
  mintTx.value = tx
  isCertificateModalShown.value = false
  isMintSuccess.value = true
}

getCertificates()
</script>

<style scoped lang="scss">
.all-certificates-page {
  margin: 0 auto;
  width: 100%;
}

.all-certificates-page__search-wrp {
  margin-top: toRem(24);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: toRem(20);
  margin-bottom: toRem(50);
}

.all-certificates-page__search {
  max-width: toRem(458);
  width: 100%;
  max-height: toRem(50);
  height: 100%;
}

.all-certificates-page__btns-wrp {
  max-width: toRem(300);
  width: 100%;

  @include respond-to(large) {
    max-width: toRem(250);
  }

  @include respond-to(xmedium) {
    max-width: toRem(200);
  }
}

.all-certificates-page__btns {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.all-certificates-page__btn {
  height: toRem(52);
  width: toRem(120);
  margin-left: toRem(5);
  border-radius: toRem(8);

  @include respond-to(large) {
    width: toRem(80);
    height: toRem(45);
  }

  @include respond-to(xmedium) {
    width: toRem(60);
    height: toRem(40);
  }
}

.all-certificates-page__btn-ref {
  height: toRem(52);
  width: toRem(52);
  margin-left: toRem(5);
  border-radius: toRem(8);
}

.all-certificates-page__list-subtitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: toRem(810);
  margin-top: toRem(20);
  margin-left: toRem(120);
  width: 100%;
}

.all-certificates-page__filters {
  display: flex;
  max-width: toRem(400);
  width: 100%;
  justify-content: space-between;
}

.all-certificates-page__no-data-message {
  margin-top: 15vh;
}
</style>
