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

      <div class="previously-certificates-page__filters">
        <!-- todo move to  external  component-->

        <app-dropdown
          :title="COURSE_FILTERS.ALL"
          :items="DROP_DOWN_COURSE_LIST"
          @select-item="findByCourse"
        />
        <app-dropdown
          :title="DATA_FILTERS.ALL"
          :items="DROP_DOWN_DATA_LIST"
          :main-image="'/branding/data-ico.png'"
        />
        <app-dropdown
          :title="STATE_FILTERS.ALL"
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
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import {
  CertificateJSONResponse,
  DropdownItem,
  PottyCertificateRequest,
} from '@/types'
import { api } from '@/api'
import { InputField } from '@/fields'
import { ref, computed } from 'vue'
import { Signature } from '@/utils'
import {
  AppButton,
  AppDropdown,
  Certificate,
  CertificateModal,
  NoDataMessage,
} from '@/common'
import {
  ErrorHandler,
  searchInTheList,
  prepareCertificateImage,
} from '@/helpers'
import {
  COURSE_FILTERS,
  DATA_FILTERS,
  STATE_FILTERS,
} from '@/enums/filter.enum'
import { useI18n } from 'vue-i18n'
import { useRouter } from '@/router'
import {
  useCreatePdf,
  useDownloadImage,
  useValidateContainerState,
} from '@/api/api'
import { FILES_BASE, ROUTE_NAMES } from '@/enums'

const userState = useUserStore()

const { t } = useI18n()

const selectedItems = ref<CertificateJSONResponse[]>([])
const certificatesList = ref<CertificateJSONResponse[]>([])
const selectedCount = ref(0)

const router = useRouter()

const isCertificateModalShown = ref(false)
const currentCertificate = ref<CertificateJSONResponse>(
  {} as CertificateJSONResponse,
)
const listForTimestamp = ref<CertificateJSONResponse[]>([])
const searchData = ref('')

const isLoading = ref(false)
const processState = ref('')
const isMintSuccess = ref(false)
const mintTx = ref('')

const DROP_DOWN_COURSE_LIST = [
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.ALL,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.SOLIDITY,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.GOLANG,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.DATABASE,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.DEFI,
  },
] as DropdownItem[]

const DROP_DOWN_DATA_LIST = [
  {
    text: DATA_FILTERS.ALL,
  },
  {
    text: DATA_FILTERS.DAY,
  },
  {
    text: DATA_FILTERS.WEEK,
  },
  {
    text: DATA_FILTERS.MONTH,
  },
] as DropdownItem[]

const DROP_DOWN_STATE_LIST = [
  {
    text: STATE_FILTERS.ALL,
  },
  {
    text: STATE_FILTERS.GENERATED,
  },
  {
    text: STATE_FILTERS.NOTGENERATED,
  },
] as DropdownItem[]

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
    processState.value = t(
      'previously-certificates-page.process-state-upload-img',
    )
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
    userState.setCertificates(prepareCertificateImage(data))
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const findByCourse = (filter: DropdownItem) => {
  //todo make using computed
  const currentCourse = filter.text
  certificatesList.value = userState.certificates
  if (!currentCourse.length || currentCourse === COURSE_FILTERS.ALL) {
    certificatesList.value = userState.certificates
    return
  }

  const searchQuery = currentCourse.toLowerCase()
  certificatesList.value = certificatesList.value.filter(user => {
    const courseTitle = user.courseTitle.toLowerCase()
    return courseTitle.includes(searchQuery)
  })
}

const findByState = (filter: DropdownItem) => {
  const state = filter.text

  certificatesList.value = userState.certificates
  if (!state.length || state === STATE_FILTERS.ALL) {
    certificatesList.value = userState.certificates
    return
  }

  if (state === STATE_FILTERS.GENERATED) {
    certificatesList.value = certificatesList.value.filter(certificate => {
      return certificate.certificate || certificate.digitalCertificate
    })
  } else if (state === STATE_FILTERS.NOTGENERATED) {
    certificatesList.value = certificatesList.value.filter(certificate => {
      return !certificate.signature!.length
    })
  }
}

const generate = async () => {
  try {
    isLoading.value = true
    processState.value = t(
      'previously-certificates-page.process-state-validate-data',
    )
    if (!validateItemListGenerate()) {
      isLoading.value = false
      return
    }

    processState.value = t(
      'previously-certificates-page.process-state-sign-data',
    )

    const signatures = await sign(selectedItems.value)
    processState.value = t(
      'previously-certificates-page.process-state-create-pdf',
    )

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
  data.clear_certificate = prepareCertificate(data.certificates)
  return data
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
  const signature = new Signature(userState.userSetting.signKey)
  for (const user of users) {
    if (!user.signature) {
      user.signature = signature.signMsg(user.msg)
    }
  }

  return users
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

    return prepareCertificateImg(container.clear_certificate)
  } catch (error) {
    ErrorHandler.process(error)
    return []
  }
}

const successMint = (tx: string) => {
  mintTx.value = tx
  isMintSuccess.value = true
}

const prepareCertificate = (certificates: PottyCertificateRequest[]) => {
  const certificateList = ref<CertificateJSONResponse[]>([])
  for (const certificate of certificates) {
    certificate.attributes.id = Number(certificate.id)
    certificateList.value.push(certificate.attributes)
  }
  return certificateList.value
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

getCertificates()
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
}

.all-certificates-page___list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
