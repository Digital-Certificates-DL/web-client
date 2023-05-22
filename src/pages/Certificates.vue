<template>
  <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />
  <div class="certificates">
    <h2>{{ $t('certificates.certificates-title') }}</h2>
    <div class="certificates__nav">
      <div class="certificates__search-wrp">
        <div class="certificates__search-input-wrp">
          <input-field
            class="certificates__search-input"
            v-model="form.search"
            :placeholder="$t('certificates.certificates-find')"
            @update:model-value="find"
          />
        </div>
        <div class="certificates__filters">
          <app-dropdown
            :items="dropDownCourseList"
            @select-item="findByCourse"
          />
          <app-dropdown
            :title="'Data'"
            :items="dropDownDataList"
            :main-image="'@/../static/branding/data-ico.png'"
            @select-item="findByDate"
          />
          <app-dropdown
            :title="'All'"
            :items="dropDownStateList"
            :main-image="'@/../static/branding/success-ico.png'"
          />
        </div>
      </div>
      <div v-if="selectedCount > 0" class="certificates__btns">
        <p class="certificates__count">
          {{ selectedCount }}
        </p>
        <app-button :text="$t('certificates.generate-btn')" @click="generate" />
        <app-button :text="$t('certificates.bitcoin-btn')" @click="timestamp" />
      </div>
    </div>
    <certificate-modal v-model:is-shown="isModalActive" :user="currentUser" />

    <div class="certificates__list">
      <div class="certificates__list-titles">
        <p>{{ $t('certificates.certificates-subtitle-name') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-course') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-date') }}</p>
        <p></p>
      </div>
      <div v-if="userList.length === 0">
        <error-message :message="$t('certificates.error-certificate-list')" />
      </div>
      <div v-for="(item, key) in userList" :value="key" :key="item">
        <certificate
          :user="item"
          v-model:is-show="isShowCertificateCheckbox"
          @open-modal="openModal"
          @select="selectItem"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'

import { UserJSONResponse } from '@/types'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import { ErrorMessage, Certificate, CertificateModal } from '@/common'
import { ROUTE_NAMES } from '@/enums'

import { Signature } from '@/utils'
import { useRouter } from '@/router'
import AppButton from '@/common/AppButton.vue'
import LoaderModal from '@/common/modals/LoaderModal.vue'
import AppDropdown from '@/common/AppDropdown.vue'
import { DropdownItem } from '@/types/dropdown.types'
import { Duration } from '@/utils/duration.util'
import { Time } from '@/utils/time'
import { ErrorHandler } from '@/helpers'
import { tryOnBeforeMount } from '@vueuse/core'

const router = useRouter()
const userState = useUserStore()
const isModalActive = ref(false)
const currentUser = ref({} as UserJSONResponse)
const isLoading = ref(false)
let userBuffer: UserJSONResponse[]

const isUnauthorized = ref(false)
const authLink = ref('')
const isShowCertificateCheckbox = ref(false)

const userList = ref([] as UserJSONResponse[])
const selectedItems = ref([] as UserJSONResponse[])
const selectedCount = ref(0)
const processState = ref('')

const dropDownCourseList = [
  {
    img: '@/../static/branding/solidity-ico.png',
    text: 'Solidity',
  },
  {
    img: '@/../static/branding/solidity-ico.png',
    text: 'Golang',
  },
  {
    img: '@/../static/branding/solidity-ico.png',
    text: 'Database',
  },
  {
    img: '@/../static/branding/solidity-ico.png',
    text: 'Defi',
  },
] as DropdownItem[]

const dropDownDataList = [
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

const form = reactive({
  search: '',
})
const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser.value = user
}

const prepareUserImg = (users: UserJSONResponse[]) => {
  for (const user of users) {
    if (user.certificateImg === null) {
      continue
    }
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
}

const refresh = async () => {
  try {
    const { data } = await api.post<UserJSONResponse[]>(
      '/integrations/ccp/users/',
      {
        body: {
          data: {
            name: userState.setting.name,
            url: userState.setting.url,
          },
        },
      },
    )
    userList.value = prepareUserImg(data)
  } catch (err) {
    if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      try {
        const { data } = await api.post('/integrations/ccp/users/token', {
          body: {
            data: {
              name: userState.setting.name,
              code: '',
            },
          },
        })

        authLink.value = data!.toString()
        isUnauthorized.value = true
      } catch (error) {
        ErrorHandler.process(error)
      }
    } else if (err.name === 'NotFoundError') {
      await router.push(ROUTE_NAMES.settings)
    }
  }
}

// const find = () => {
//   userBuffer = userState.students
//
//   if (form.search === '' && userBuffer !== undefined) {
//     userState.students = userBuffer
//   }
//   userState.students.filter(item => item.participant.includes(form.search))
// }

const find = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
    return
  }

  const searchQuery = form.search.toLowerCase()
  const filteredUsers = userBuffer.filter(user => {
    const participant = user.participant.toLowerCase()
    return participant.includes(searchQuery)
  })

  userState.students = filteredUsers
}

const findByCourse = (filter: DropdownItem) => {
  const currentCourse = filter.text
  userBuffer = userState.students
  //todo add types
  if (
    (currentCourse === '' || currentCourse === 'All') &&
    userBuffer !== undefined
  ) {
    userState.students = userBuffer
    return
  }

  const searchQuery = currentCourse.toLowerCase()
  const filteredUsers = userBuffer.filter(user => {
    const courseTitle = user.courseTitle.toLowerCase()
    return courseTitle.includes(searchQuery)
  })

  userState.students = filteredUsers
}

const findByDate = (filter: DropdownItem) => {
  const currentDate = filter.text

  userBuffer = userState.students
  //todo add types
  if (
    (currentDate === '' || currentDate === 'All') &&
    userBuffer !== undefined
  ) {
    userState.students = userBuffer
    return
  }
  let diff: Duration
  switch (currentDate) {
    case 'Week':
      diff = new Duration({ days: 7 })
      break
    case 'Day':
      diff = new Duration({ days: 1 })
      break
    case 'Month':
      diff = new Duration({ months: 1 })
      break
    case 'Year':
      diff = new Duration({ years: 1 })
      break
  }

  const filteredUsers = userBuffer.filter(user => {
    const timeNow = new Time()
    const exTime = new Time(user.date)
    const delta = timeNow.diff(exTime)

    if (delta < diff.asMilliseconds) {
      return true
    }
    return false
  })

  userState.students = filteredUsers
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

  userState.bufferUserList = users
  await router.push({
    name: ROUTE_NAMES.timestamp,
  })
}

const timestamp = async () => {
  userState.bufferUserList = selectedItems.value
  if (validateItemListTimestamp()) {
    await router.push({
      name: ROUTE_NAMES.timestamp,
    })
  }
}

const sign = async (users: UserJSONResponse[]) => {
  const signature = new Signature(userState.setting.signKey)
  for (const user of users) {
    if (user.signature === undefined || user.signature == '') {
      user.signature = signature.signMsg(user.msg)
    }
  }

  return users
}

const createPDF = async (users: UserJSONResponse[]) => {
  const { data } = await api.post<UserJSONResponse[]>(
    '/integrations/ccp/certificate/',
    {
      body: {
        data: {
          users: users, //todo make better
          address:
            userState.setting.address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
          url: userState.setting.url,
          name: userState.setting.name,
        },
      },
    },
  )
  const updatedUsers = prepareUserImg(data)
  userState.students = updatedUsers
  return data
}

// const updateUsers = async (users: UserJSONResponse[]) => {
//   const { data } = await api.put<UserJSONResponse[]>(
//     '/integrations/ccp/certificate/',
//     {
//       body: {
//         data: {
//           users: users,
//           address: userState.setting.address,
//           name: userState.setting.name,
//           url: userState.setting.url,
//         },
//       },
//     },
//   )
//
//   userState.students = data
// }

const autoRefresh = () => {
  if (userState.students.length === 0) {
    refresh()
  }
  userList.value = userState.students
}

tryOnBeforeMount(autoRefresh)

const selectItem = (state: boolean, item: UserJSONResponse) => {
  if (state) {
    selectedItems.value.push(item)
    selectedCount.value = selectedItems.value.length
    isShowCertificateCheckbox.value = true
    return
  }

  const index = selectedItems.value.indexOf(item, 0)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
  selectedCount.value = selectedItems.value.length
  if (selectedCount.value < 1) {
    isShowCertificateCheckbox.value = false
    return
  }
  isShowCertificateCheckbox.value = true
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
</script>

<style scoped lang="scss">
.certificates {
  margin: 0 auto;
  width: toRem(1400);

  @include respond-to(large) {
    width: var(--page-xmedium);
  }

  @include respond-to(xmedium) {
    width: var(--page-medium);
  }
}

.certificates__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.certificates__search-wrp {
  margin-top: toRem(24);
  width: 70%;
  display: flex;
  align-items: center;
  margin-bottom: toRem(20);
}

.certificates__search-input-wrp {
  width: toRem(458);
  margin-right: toRem(30);
}

.certificates__search-input {
  width: toRem(458);
}

.certificates__btns {
  display: flex;
  justify-content: space-between;
  width: 25%;
  align-items: center;
}

.certificates__btn {
  height: toRem(52);
  border-radius: toRem(8);

  @include respond-to(large) {
    font-size: toRem(10);
  }

  @include respond-to(xmedium) {
    font-size: toRem(8);
  }

  @include respond-to(medium) {
    font-size: toRem(6);
  }
}

.certificates__filters {
  display: flex;
  max-width: toRem(400);
  width: 100%;
  justify-content: space-between;
}

.certificates__list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
  margin-left: toRem(120);
  width: 83%;
}
</style>
