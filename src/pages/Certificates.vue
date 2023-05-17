<template>
  <div class="certificates">
    <h2>{{ $t('certificates.certificates-title') }}</h2>
    <div class="certificates__search-wrp">
      <div class="certificates__search-input-wrp">
        <input-field
          class="certificates__search-input"
          v-model="form.search"
          :placeholder="$t('certificates.certificates-find')"
          @update:model-value="find"
        />
        <div v-if="generateCount > 0">
          <app-button :text="'generate'" @click="generate" />
        </div>
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

const router = useRouter()
const userState = useUserStore()
const isModalActive = ref(false)
const currentUser = ref({} as UserJSONResponse)
// const listForTimestamp: UserJSONResponse[] = []

let userBuffer: UserJSONResponse[]

// const isUnauthorized = ref(false)
// const authLink = ref('')

const userList = ref([] as UserJSONResponse[])
const listForCreate = ref([] as UserJSONResponse[])
const generateCount = ref(0)
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

// const selectForTimestamp = (state: boolean, user: UserJSONResponse) => {
//   if (state) {
//     listForTimestamp.push(user)
//
//     return
//   }
//   listForTimestamp.filter(item => item !== user)
// }
const closeModal = () => {
  isModalActive.value = false
}
const refresh = async () => {
  const { data } = await api.post<UserJSONResponse[]>(
    '/integrations/ccp/users/',
    {
      body: {
        data: {
          url: userState.setting.url,
          name: userState.setting.name,
        },
      },
    },
  )
  userState.students = prepareUserImg(data)

  // console.log(users)
  //
  // if (users.isLinksExist === false) {
  // }
  // console.log('users ', prepareUserImg(data))
  // userList.value = prepareUserImg(data).data

  userList.value = data
}

const find = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item => item.participant.includes(form.search))
}

const generate = async () => {
  const users = listForCreate.value
  // loaderState.value = 'Signing users'
  const signatures = await sign(users)
  // loaderState.value = 'Creating PDF for users'

  userState.students = await createPDF(signatures)

  // loaderState.value = ''
  // isLoader.value = false

  await router.push(ROUTE_NAMES.timestamp)
}

// const updateCode = async (code: string) => {
//   isUnauthorized.value = false
//   await api.post<UserJSONResponse[]>('/integrations/ccp/users/settings', {
//     body: {
//       data: {
//         code: code,
//         name: userState.setting.Name,
//       },
//     },
//   })
//
//   isUnauthorized.value = false
// }
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

const updateUsers = async (users: UserJSONResponse[]) => {
  const { data } = await api.put<UserJSONResponse[]>(
    '/integrations/ccp/certificate/',
    {
      body: {
        data: {
          users: users,
          address: userState.setting.address,
          name: userState.setting.name,
          url: userState.setting.url,
        },
      },
    },
  )

  userState.students = data
}

const autoRefresh = () => {
  if (userState.students.length === 0) {
    refresh()
  }
  userList.value = userState.students
}

autoRefresh()

const selectItem = (state: boolean, item: UserJSONResponse) => {
  if (state) {
    listForCreate.value.push(item)
    generateCount.value = listForCreate.value.length
    return
  }

  const index = listForCreate.value.indexOf(item, 0)
  if (index > -1) {
    listForCreate.value.splice(index, 1)
  }
  generateCount.value = listForCreate.value.length
}
</script>

<style scoped lang="scss">
.certificates {
  margin: 0 auto;
  width: toRem(1400);
}

.certificates__search-wrp {
  margin-top: toRem(24);
  display: flex;
  justify-content: space-between;
  border-radius: toRem(20);
}

.certificates__search-input-wrp {
  margin-bottom: toRem(20);
  width: toRem(458);
}

.certificates__btns {
  display: flex;
  justify-content: space-between;
}

.certificates__btn {
  height: toRem(52);
  border-radius: toRem(8);
}

.certificates__list-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}
</style>
