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
          v-model="filteredCourse"
          :title="DROP_DOWN_COURSE_LIST[0].text"
          :items="DROP_DOWN_COURSE_LIST"
        />
        <app-dropdown
          v-model="filteredState"
          main-image="/branding/success-ico.png"
          :title="DROP_DOWN_STATE_LIST[0].text"
          :items="DROP_DOWN_STATE_LIST"
        />
      </div>

      <div class="all-certificates-page__btns-wrp">
        <div v-if="selectedCount" class="all-certificates-page__btns">
          <p>
            {{ selectedCount }}
          </p>
          <app-button
            class="all-certificates-page__btn"
            color="info"
            :text="$t('all-certificates-page.generate-btn-text')"
            @click="issueCertificates"
          />
          <app-button
            class="all-certificates-page__btn"
            color="info"
            :text="$t('all-certificates-page.bitcoin-btn-text')"
            @click="moveToTimestamp"
          />
        </div>
      </div>
    </div>

    <div class="all-certificates-page__list">
      <div class="all-certificates-page__list-titles">
        <!--  eslint-disable max-len-->
        <p
          class="all-certificates-page__list-title all-certificates-page__list-title--start"
        >
          {{ $t('all-certificates-page.certificates-item-name') }}
        </p>
        <p class="all-certificates-page__list-title">
          {{ $t('all-certificates-page.certificates-item-course') }}
        </p>
        <p class="all-certificates-page__list-title">
          {{ $t('all-certificates-page.certificates-item-date') }}
        </p>
      </div>

      <no-data-message
        v-if="!userState.certificates.length"
        class="all-certificates-page__no-data-message"
        :message="$t('all-certificates-page.empty-certificates-list')"
      />

      <certificate
        class="all-certificates-page__certificate-item"
        v-for="item in filteredCertificates"
        :key="item.id"
        :certificate="item"
        @open-modal="openCertificateModal"
        @select="selectItem"
      />
    </div>

    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :certificate="currentCertificate"
      @success="onSuccessMint"
      @error="onErrorMint"
    />
    <loader-modal v-model:is-shown="isLoading" v-model:text="loaderText" />
    <success-modal
      v-model:is-shown="isMintSuccessModalShown"
      :transaction="mintTx"
    />
    <error-modal v-model:is-shown="isErrorModalShown" :message="errorMsg" />
    <container-error-modal
      v-model:is-shown="isContainerErrorModalShown"
      :is-shown="isContainerErrorModalShown"
      :container-id="processingContainerID"
      @try-again="revalidateContainerState"
    />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { CertificateJSONResponse } from '@/types'
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
  ErrorModal,
  ContainerErrorModal,
} from '@/common'
import {
  prepareCertificateImage,
  validateContainerStateWrapper,
  ErrorHandler,
  searchInTheList,
  signCertificateData,
  validateListCanMakeTimestamp,
  validateListNeedToGenerate,
  filteringByCourse,
  filteringByState,
} from '@/helpers'
import { ROUTE_NAMES } from '@/enums'
import { createPdf, downloadCertificateImage, uploadCertificates } from '@/api'
import { errors } from '@/errors'
import { useI18n } from 'vue-i18n'
import { DROP_DOWN_COURSE_LIST, DROP_DOWN_STATE_LIST } from '@/constant'
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
const loaderText = ref('')
const isMintSuccessModalShown = ref(false)
const isErrorModalShown = ref(false)
const isContainerErrorModalShown = ref(false)
const processingContainerID = ref('')
const mintTx = ref('')
const errorMsg = ref('')

const filteredState = ref('')
const filteredCourse = ref('')

const filteredCertificates = computed(() => {
  return filteringByState(
    filteringByCourse(
      searchInTheList(certificatesList.value, searchData.value),
      filteredCourse.value,
    ),
    filteredState.value,
  )
})

const openCertificateModal = async (certificate: CertificateJSONResponse) => {
  try {
    if (!certificate.certificateImg) {
      isLoading.value = true

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
    ErrorHandler.process(error)
  }
}

const selectItem = (isSelected: boolean, item: CertificateJSONResponse) => {
  if (isSelected) {
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
    loaderText.value = t('all-certificates-page.image_uploading')
    const data = await downloadCertificateImage(
      certificate,
      userState.userSetting.userBitcoinAddress,
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
    return data
  } catch (error) {
    throw errors.FailedDownloadImage
  } finally {
    isLoading.value = false
  }
}

const getCertificates = async () => {
  try {
    isLoading.value = true
    loaderText.value = t('all-certificates-page.loader-text-update-date')
    const data = await uploadCertificates(
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )

    userState.setCertificates(data)
    certificatesList.value = userState.certificates
  } catch (error) {
    ErrorHandler.process(error)
  }
  isLoading.value = false
}

const moveToTimestamp = async () => {
  userState.setBufferCertificates(selectedItems.value)
  if (!validateListCanMakeTimestamp(selectedItems.value)) {
    ErrorHandler.process(t('warnings.certificate-has-timestamp'))
    return
  }
  await router.push({
    name: ROUTE_NAMES.timestamp,
  })
}

const issueCertificates = async () => {
  try {
    isLoading.value = true
    loaderText.value = t('all-certificates-page.loader-text-validate-data')
    if (!validateListNeedToGenerate(selectedItems.value)) {
      isLoading.value = false
      ErrorHandler.process(t('warnings.certificate-was-generated'))
      return
    }

    loaderText.value = t('all-certificates-page.loader-text-sign-data')

    const signatures = await signCertificateData(
      selectedItems.value,
      userState.userSetting.signKey,
    )

    loaderText.value = t('all-certificates-page.loader-text-create-pdf')
    processingContainerID.value = await generatePDF(signatures)

    await asyncValidateContainerState(processingContainerID.value)

    userState.setBufferCertificates(userState.certificates)
    loaderText.value = ''

    await router.push({
      name: ROUTE_NAMES.timestamp,
    })
  } catch (error) {
    if (error === errors.RateLimit) {
      isContainerErrorModalShown.value = true
      return
    }
    ErrorHandler.process(error)
  } finally {
    isLoading.value = false
  }
}

const revalidateContainerState = async () => {
  try {
    isLoading.value = true
    await asyncValidateContainerState(processingContainerID.value)
    userState.setBufferCertificates(userState.certificates)
    loaderText.value = ''

    await router.push({
      name: ROUTE_NAMES.timestamp,
    })
  } catch (error) {
    if (error === errors.RateLimit) {
      isContainerErrorModalShown.value = true
      return
    }
    ErrorHandler.process(error)
  } finally {
    isLoading.value = false
  }
}

const generatePDF = async (certificates: CertificateJSONResponse[]) => {
  const data = await createPdf(
    certificates,
    userState.userSetting.userBitcoinAddress,
    userState.userSetting.accountName,
    userState.userSetting.urlGoogleSheet,
  )
  return data.container_id
}

const asyncValidateContainerState = async (containerID: string) => {
  const container = await validateContainerStateWrapper(containerID)

  userState.setCertificates(
    prepareCertificateImage(container.clear_certificate),
  )
}

const onSuccessMint = (tx: string) => {
  mintTx.value = tx
  isCertificateModalShown.value = false
  isMintSuccessModalShown.value = true
}

const onErrorMint = (msg: string) => {
  isCertificateModalShown.value = false
  errorMsg.value = msg
  isErrorModalShown.value = true
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

.all-certificates-page__list-titles {
  display: grid;
  grid-template-columns: 1fr 2fr 4fr 1fr 3fr;
  margin-left: toRem(25);
  gap: toRem(50);
  justify-content: space-between;
  margin-top: toRem(20);
  width: 100%;
}

.all-certificates-page__filters {
  display: flex;
  max-width: toRem(260);
  width: 100%;
  margin-left: toRem(10);
  justify-content: space-between;
}

.all-certificates-page__no-data-message {
  margin-top: toRem(100);
}

.all-certificates-page__list-title {
  text-align: center;
}

.all-certificates-page__list-title--start {
  grid-column-start: 2;
}

.all-certificates-page__certificate-item {
  margin-top: toRem(35);
  padding-bottom: toRem(10);
}
</style>
