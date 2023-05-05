<template>
  <div class="certificates">
    <app-navbar />

    <h1>{{ $t('certificates.certificates-title') }}</h1>
    <div class="certificates__search">
      <input-field
        class="certificates__search-input"
        placeholder="find"
        v-model="form.search"
        @update:model-value="search"
      />
      <div v-if="generateCount > 0" class="certificates__btns">
        <p>{{ generateCount }}</p>
        <app-button class="certificates__btn" text="Generate All" />
      </div>
    </div>
    <div v-if="isModalActive">
      <modal-info @cancel="closeModal" :user="currentUser"></modal-info>
    </div>
    <div class="certificates__list">
      <div class="certificates__list-titles">
        <p>{{ $t('certificates.certificates-subtitle-name') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-course') }}</p>
        <p>{{ $t('certificates.certificates-subtitle-date') }}</p>
      </div>
      <div v-if="userState.students.length === 0">
        <error-message message="Empty certificate list" />
      </div>

      <div
        v-for="(item, key) in userState.students"
        :value="key"
        :key="item.attributes"
      >
        <certificate
          :user="item"
          @open-modal="openModal"
          @select-for-timestamp="selectForTimestamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import ModalInfo from '@/common/modals/CertificateModal.vue'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import btc from '@/utils/bitcoin.util'
import { AppNavbar, ErrorMessage, AppButton, Certificate } from '@/common'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { Signature } from '@/utils/signature.utils'

const userState = useUserStore()
const isModalActive = ref(false)
let currentUser: UserJSONResponse
let userBuffer

const listForCreate: UserJSONResponse[] = []
const generateCount = ref(0)
const form = reactive({
  search: '',
})
const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser = user
}

const closeModal = () => {
  isModalActive.value = false
}

const refresh = async () => {
  const users = await api.post<UserJSONResponseList>(
    '/integrations/ccp/users/',
    {
      body: {
        data: {
          url: userState.setting.Url,
          name: userState.setting.Name,
        },
      },
    },
  )
  userState.students = prepareUserImg(users.data).data
}

const search = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item =>
    item.attributes.Participant.includes(form.search),
  )
}

const generate = async () => {
  const users = userState.students
  // loaderState.value = 'Signing users'
  const signatures = sign(users)
  // loaderState.value = 'Creating PDF for users'
  userState.students = await createPDF(signatures)
  // loaderState.value = ''
  // isLoader.value = false

  await router.push(ROUTE_NAMES.timestamp)
}

const sign = (users: UserJSONResponse[]) => {
  const signature = new Signature(userState.setting.SignKey)
  for (const user of users) {
    if (
      user.attributes.Signature === undefined ||
      user.attributes.Signature == ''
    ) {
      user.attributes.Signature = signature.signMsg(user.attributes.Msg)
    }
  }
  return users
}

const prepareUserImg = (users: UserJSONResponseList) => {
  const list: UserJSONResponse[] = users.data
  for (const user of list) {
    user.attributes.Img =
      'data:image/png;base64,' + user.attributes.CertificateImg.toString()
  }

  return users
}
const createPDF = async (users: UserJSONResponse[]) => {
  const resp = await api.post<UserJSONResponseList>(
    '/integrations/ccp/certificate/',
    {
      body: {
        data: {
          data: users, //todo make better
          address:
            userState.setting.Address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
          url: userState.setting.Url,
          name: userState.setting.Name,
        },
      },
    },
  )

  const updatedUsers = prepareUserImg(resp.data)
  userState.students = updatedUsers.data
  return resp.data.data
}

const updateUsers = async (users: UserJSONResponse[]) => {
  const { data } = await api.post<UserJSONResponseList>(
    '/integrations/ccp/certificate/bitcoin',
    {
      body: {
        data: {
          data: users,
          address: userState.setting.Address,
          name: userState.setting.Name,
          url: userState.setting.Url,
        },
      },
    },
  )

  userState.students = data.data
}

const autoRefresh = () => {
  if (userState.students.length === 0) {
    refresh()
  }
}

autoRefresh()

const selectForCreate = (state: boolean, user: UserJSONResponse) => {
  if (state) {
    listForCreate.push(user)
    return
  }

  listForCreate.filter(item => item !== user)
}
</script>

<style lang="scss" scoped>
.certificates__search {
  width: toRem(458);
  border-radius: toRem(20);
}

.certificates__search-input {
  margin-bottom: toRem(20);
}

.certificates__btns {
  display: flex;
  justify-content: space-between;
}

.certificates__btn {
  background: var(--primary-dark);
  width: toRem(100);
}

.certificates__list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
