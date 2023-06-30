<template>
  <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />
  <div class="previously-certificates-page">
    <h2>{{ $t('previously-certificates-page.certificates-title') }}</h2>
    <div class="previously-certificates-page__search-wrp">
      <div class="previously-certificates-page__search">
        <input-field
          class="previously-certificates-page__search-input"
          :model-value="searchInputValue"
          :placeholder="$t('previously-certificates-page.certificates-find')"
        />
      </div>

      <app-button
        class="previously-certificates-page__btn"
        color="info"
        :text="$t('previously-certificates-page.refresh-btn')"
        @click="refresh"
      />
      <div class="previously-certificates-page__filters">
        <app-dropdown :items="dropDownCourseList" @select-item="findByCourse" />
        <app-dropdown
          :title="'Data'"
          :items="dropDownDataList"
          :main-image="'/branding/data-ico.png'"
        />
        <app-dropdown
          :title="'All'"
          :items="dropDownStateList"
          :main-image="'/branding/success-ico.png'"
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
      :certificate="currentUser"
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
      <div v-for="item in userBuffer" :key="item.id">
        <certificate
          :is-show="selectedItems.length > 0"
          @open-modal="openCertificateModal"
          @select="selectItem"
          :certificate="item"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { CertificateJSONResponse, DropdownItem } from '@/types'
import { api } from '@/api'
import { InputField } from '@/fields'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from '@/router'

import {
  ErrorMessage,
  AppButton,
  Certificate,
  AppDropdown,
  CertificateModal,
} from '@/common'
import { Signature } from '@/utils'
import { ErrorHandler } from '@/helpers'
import { ROUTE_NAMES } from '@/enums'
import { LoaderModal } from '@/common/modals'

const userState = useUserStore()

const isCertificateModalShown = ref(false)
const currentUser = ref<CertificateJSONResponse>({} as CertificateJSONResponse)
const selectedItems = ref<CertificateJSONResponse[]>([])
const userBuffer = ref<CertificateJSONResponse[]>([])
const searchInputValue = ref('')
const selectedCount = ref(0)

const router = useRouter()

const isLoading = ref(false)
const processState = ref('')

const dropDownCourseList = [
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

const dropDownDataList = [
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

const dropDownStateList = [
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

const openCertificateModal = (user: CertificateJSONResponse) => {
  isCertificateModalShown.value = true
  currentUser.value = user
}

const prepareUsersImage = (users: CertificateJSONResponse[]) => {
  for (const user of users) {
    if (!user.certificateImg) {
      user.img = ''
      continue
    }
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
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
    userState.students = prepareUsersImage(data)
    userBuffer.value = userState.students
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const findByCourse = (filter: DropdownItem) => {
  const currentCourse = filter.text
  userBuffer.value = userState.students
  if (currentCourse === '' || currentCourse === 'All') {
    userBuffer.value = userState.students
    return
  }

  const searchQuery = currentCourse.toLowerCase()
  const filteredUsers = userBuffer.value.filter(user => {
    const courseTitle = user.courseTitle.toLowerCase()
    return courseTitle.includes(searchQuery)
  })

  userBuffer.value = filteredUsers
}

const generate = async () => {
  isLoading.value = true
  processState.value = 'Validate data'
  if (!validateItemListGenerate()) {
    isLoading.value = false
    return
  }

  processState.value = 'Sign data'

  const signatures = await sign(selectedItems.value)
  processState.value = 'Create pdfs'

  const users = await createPDF(signatures)
  processState.value = ''

  isLoading.value = false

  userState.bufferCertificateList = users
  await router.push({
    name: ROUTE_NAMES.timestamp,
  })
}

const validateItemListGenerate = () => {
  for (const item of selectedItems.value) {
    if (item.certificate !== '' || item.signature !== '') {
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
    if (user.signature === undefined || user.signature == '') {
      user.signature = signature.signMsg(user.msg)
    }
  }

  return users
}

const createPDF = async (users: CertificateJSONResponse[]) => {
  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/certificate/',
    {
      body: {
        data: {
          users: users, //todo make better
          address:
            userState.setting.userBitcoinAddress ||
            '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
          url: userState.setting.urlGoogleSheet,
          name: userState.setting.accountName,
        },
      },
    },
  )
  const updatedUsers = prepareUserImg(data)
  userState.students = updatedUsers
  return data
}

const prepareUserImg = (users: CertificateJSONResponse[]) => {
  for (const user of users) {
    if (user.certificateImg === null) {
      continue
    }
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
}

const autoRefresh = () => {
  if (userState.students.length === 0) {
    refresh()
  }
  userBuffer.value = userState.students
}

onBeforeMount(autoRefresh)
</script>

<style scoped lang="scss">
.previously-certificates-page {
  margin: 0 auto;
  width: var(--page-large);

  @include respond-to(large) {
    width: var(--page-xmedium);
  }

  @include respond-to(xmedium) {
    width: var(--page-medium);
  }
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
