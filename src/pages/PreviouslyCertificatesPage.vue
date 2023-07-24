<template>
  <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />
  <success-modal v-model:is-shown="isMintSuccess" :transaction="mintTx" />
  <div class="previously-certificates-page">
    <h2>{{ $t('previously-certificates-page.certificates-title') }}</h2>
    <div class="previously-certificates-page__search-wrp">
      <div class="previously-certificates-page__search">
        <input-field
          class="previously-certificates-page__search-input"
          v-model="searchData"
          :placeholder="$t('previously-certificates-page.certificates-find')"
        />
      </div>

      <app-button
        class="previously-certificates-page__btn"
        size="large"
        color="info"
        :icon-right="$icons.refresh"
        @click="refresh"
      />
      <div class="previously-certificates-page__filters">
        <app-dropdown
          :items="DROP_DOWN_COURSE_LIST"
          @select-item="findByCourse"
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
          @select-item="findByState"
        />
      </div>

      <div class="previously-certificates-page__btns-wrp">
        <div
          v-if="selectedCount > 0"
          class="previously-certificates-page__btns"
        >
          <p class="previously-certificates__count">
            {{ selectedCount }}
          </p>
          <app-button
            class="previously-certificates-page__btn"
            color="info"
            :text="$t('previously-certificates-page.generate-btn')"
            @click="generate"
          />
          <app-button
            class="previously-certificates-page__btn"
            color="info"
            :text="$t('previously-certificates-page.bitcoin-btn')"
            @click="timestamp"
          />
        </div>
      </div>
    </div>
    <certificate-modal
      v-model:is-shown="isCertificateModalShown"
      :certificate="currentCertificate"
      @success="successMint"
    />

    <div class="certificates__list">
      <div class="previously-certificates-page__list-subtitle">
        <p>
          {{ $t('previously-certificates-page.certificates-subtitle-name') }}
        </p>
        <p>
          {{ $t('previously-certificates-page.certificates-subtitle-course') }}
        </p>
        <p>
          {{ $t('previously-certificates-page.certificates-subtitle-date') }}
        </p>
      </div>
      <div v-if="!userState.students.length">
        <error-message
          :message="$t('previously-certificates.error-certificate-list')"
        />
      </div>
      <div v-for="item in certificatesListBuffer" :key="item.id">
        <certificate
          :is-show="selectedItems.length > 0"
          :certificate="item"
          @open-modal="openCertificateModal"
          @select="selectItem"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import {
  CertificateJSONResponse,
  DropdownItem,
  PottyCertificateRequest,
} from '@/types'
import { InputField } from '@/fields'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from '@/router'

import {
  AppButton,
  AppDropdown,
  Certificate,
  CertificateModal,
  ErrorMessage,
} from '@/common'
import { Signature } from '@/utils'
import { ErrorHandler } from '@/helpers'
import { FILES_BASE, ROUTE_NAMES } from '@/enums'
import { LoaderModal } from '@/common/modals'
import SuccessModal from '@/common/modals/SuccessModal.vue'
import {
  useCreatePdf,
  useDownloadImage,
  useUploadCertificates,
  useValidateContainerState,
} from '@/api/api'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const userState = useUserStore()

const isCertificateModalShown = ref(false)
const currentCertificate = ref<CertificateJSONResponse>(
  {} as CertificateJSONResponse,
)
const selectedItems = ref<CertificateJSONResponse[]>([])
const certificatesListBuffer = ref<CertificateJSONResponse[]>([])
const searchData = ref('')
const selectedCount = ref(0)

const router = useRouter()

const isLoading = ref(false)
const processState = ref('')
const isMintSuccess = ref(false)
const mintTx = ref('')

const DROP_DOWN_COURSE_LIST = [
  {
    img: '/branding/solidity-ico.png',
    text: 'All',
  },
  {
    img: '/branding/solidity-ico.png',
    text: 'Solidity',
  },
  {
    img: '/branding/solidity-ico.png',
    text: 'Golang',
  },
  {
    img: '/branding/solidity-ico.png',
    text: 'Database',
  },
  {
    img: '/branding/solidity-ico.png',
    text: 'Defi',
  },
] as DropdownItem[]

const DROP_DOWN_DATA_LIST = [
  {
    text: 'All',
  },
  {
    text: 'Day',
  },
  {
    text: 'Week',
  },
  {
    text: 'Month',
  },
] as DropdownItem[]

const DROP_DOWN_STATE_LIST = [
  {
    text: 'All',
  },
  {
    text: 'Generated',
  },
  {
    text: 'Not generated',
  },
] as DropdownItem[]

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
    currentCertificate.value = certificateWithImg.value[0]
    return
  }
  isCertificateModalShown.value = true
  currentCertificate.value = certificate
}

const prepareCertificateImage = (certificates: CertificateJSONResponse[]) => {
  for (const certificate of certificates) {
    if (!certificate.certificateImg) {
      certificate.img = ''
      continue
    }
    certificate.img = FILES_BASE + certificate.certificateImg.toString()
  }

  return certificates
}

const getCertificateImage = async (certificate: CertificateJSONResponse) => {
  try {
    isLoading.value = true
    processState.value = 'Upload certificate image' //todo  loc
    return await useDownloadImage(
      certificate,
      userState.setting.userBitcoinAddress,
      userState.setting.accountName,
      userState.setting.urlGoogleSheet,
    )
  } catch (error) {
    ErrorHandler.process(error)
  }

  isLoading.value = false
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

const refresh = async () => {
  try {
    isLoading.value = true
    processState.value = t(
      'previously-certificates-page.process-state-update-date',
    )
    const data = await useUploadCertificates(
      userState.setting.accountName,
      userState.setting.urlGoogleSheet,
    )

    userState.students = prepareCertificateImage(data)
    certificatesListBuffer.value = userState.students
  } catch (error) {
    ErrorHandler.process(error)
  }
  isLoading.value = false
}

const findByCourse = (filter: DropdownItem) => {
  //todo make using computed
  const currentCourse = filter.text
  certificatesListBuffer.value = userState.students
  if (!currentCourse.length || currentCourse === 'All') {
    certificatesListBuffer.value = userState.students
    return
  }

  const searchQuery = currentCourse.toLowerCase()
  certificatesListBuffer.value = certificatesListBuffer.value.filter(user => {
    const courseTitle = user.courseTitle.toLowerCase()
    return courseTitle.includes(searchQuery)
  })
}

const findByState = (filter: DropdownItem) => {
  const state = filter.text

  certificatesListBuffer.value = userState.students
  if (!state.length || state === 'All') {
    certificatesListBuffer.value = userState.students
    return
  }

  if (state === 'Generated') {
    certificatesListBuffer.value = certificatesListBuffer.value.filter(
      certificate => {
        return certificate.certificate || certificate.digitalCertificate
      },
    )
  } else if (state === 'Not generated') {
    certificatesListBuffer.value = certificatesListBuffer.value.filter(
      certificate => {
        return !certificate.signature!.length
      },
    )
  }
}

const generate = async () => {
  isLoading.value = true
  processState.value = 'Validate data' //todo   local
  if (!validateItemListGenerate()) {
    isLoading.value = false
    return
  }

  processState.value = 'Sign data' //todo   local

  const signatures = await sign(selectedItems.value)
  processState.value = 'Create pdfs' //todo   local

  const users = await createPDF(signatures)
  processState.value = ''

  isLoading.value = false
  userState.bufferCertificateList = users!

  await router.push({
    name: ROUTE_NAMES.timestamp,
  })
}

const validateItemListGenerate = () => {
  for (const item of selectedItems.value) {
    if (item.certificate !== '' || item.signature !== '') {
      //todo localization
      ErrorHandler.process(
        'This student already has certificate, ' + item.participant,
      )
      return false
    }
  }
  return true
}

const validateItemListTimestamp = () => {
  for (const item of selectedItems.value) {
    if (item.certificate === '' || item.signature === '') {
      //todo localization
      ErrorHandler.process(
        'This student does not has certificate,' + item.participant,
      )
      return false
    }
  }
  return true
}

const timestamp = async () => {
  userState.bufferCertificateList = selectedItems.value
  if (validateItemListTimestamp()) {
    await router.push({
      name: ROUTE_NAMES.timestamp,
    })
  }
}

const sign = async (users: CertificateJSONResponse[]) => {
  const signature = new Signature(userState.setting.signKey)
  for (const user of users) {
    if (!user.signature) {
      user.signature = signature.signMsg(user.msg)
    }
  }

  return users
}

const createPDF = async (certificates: CertificateJSONResponse[]) => {
  try {
    const data = await useCreatePdf(
      certificates,
      userState.setting.userBitcoinAddress,
      userState.setting.accountName,
      userState.setting.urlGoogleSheet,
    )
    const container = await validateContainerState(data.container_id)
    if (!container) {
      ErrorHandler.process(t('errors.empty-container'))
      return
    }

    userState.students = prepareCertificateImg(container.clear_certificate)
    return userState.students
  } catch (error) {
    ErrorHandler.process(error)
    return
  }
}

const validateContainerState = async (containerID: string) => {
  const data = await useValidateContainerState(containerID)
  if (!data) {
    ErrorHandler.process(t('errors.empty-container'))
    return
  }
  data.clear_certificate = prepareCertificate(data.certificates)
  return data
}

const prepareCertificateImg = (certificates: CertificateJSONResponse[]) => {
  for (const certificate of certificates) {
    if (!certificate.certificateImg) {
      continue
    }
    certificate.img =
      FILES_BASE.PNG_BASE + certificate.certificateImg.toString()
  }

  return certificates
}

const prepareCertificate = (certificates: PottyCertificateRequest[]) => {
  /* eslint-disable no-console */
  console.log('prepareCertificate: ', certificates)
  const certificateList = ref<CertificateJSONResponse[]>([])
  for (const certificate of certificates) {
    certificate.attributes.id = Number(certificate.id)
    certificateList.value.push(certificate.attributes)
  }
  return certificateList.value
}
const autoRefresh = () => {
  if (userState.students.length === 0) {
    refresh()
  }
  certificatesListBuffer.value = userState.students
}

const successMint = (tx: string) => {
  mintTx.value = tx
  isMintSuccess.value = true
}

onBeforeMount(autoRefresh)
</script>

<style scoped lang="scss">
.previously-certificates-page {
  margin: 0 auto;
  max-width: var(--page-large);
  width: 100%;
}

.previously-certificates-page__search-wrp {
  margin-top: toRem(24);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: toRem(20);
  margin-bottom: toRem(50);
}

.previously-certificates-page__search-input {
  width: toRem(458);

  @include respond-to(large) {
    width: toRem(400);
    height: toRem(50);
  }

  @include respond-to(xmedium) {
    height: toRem(30);
    width: toRem(300);
  }
}

.previously-certificates-page__btns-wrp {
  width: toRem(300);

  @include respond-to(large) {
    width: toRem(250);
  }

  @include respond-to(xmedium) {
    width: toRem(200);
  }
}

.previously-certificates-page__btns {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.previously-certificates-page__btn {
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

.previously-certificates-page__list-subtitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: toRem(810);
  margin-top: toRem(20);
  margin-left: toRem(120);

  @include respond-to(large) {
    width: toRem(650);
  }

  @include respond-to(xmedium) {
    width: toRem(500);
  }
}

.previously-certificates-page__filters {
  display: flex;
  width: toRem(400);
  justify-content: space-between;
}
</style>
