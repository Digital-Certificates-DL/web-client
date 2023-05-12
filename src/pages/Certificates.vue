<template>
  <div class="certificates">
    <div v-if="isUnauthorized">
      <auth-modal
        :token-link="authLink"
        @close-modal="closeModal"
        @with-code="updateCode"
      />
    </div>
    <app-navbar />

    <h1>{{ $t('certificates.certificates-title') }}</h1>
    <div class="certificates__search">
      <input-field
        class="certificates__search-input"
        placeholder="find"
        @update="search"
      />

      <div v-if="generateCount > 0" class="certificates__btns">
        <p>{{ generateCount }}</p>
        <app-button
          class="certificates__btn"
          text="Generate All"
          :color="'info'"
          @click="generate"
        />
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
import ModalInfo from '@/common/modals/CertificateModal.vue'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import { AppNavbar, ErrorMessage, AppButton, Certificate } from '@/common'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { Signature } from '@/utils/signature.utils'
import AuthModal from '@/common/modals/AuthModal.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const userState = useUserStore()
const isModalActive = ref(false)
let currentUser: UserJSONResponse

const isUnauthorized = ref(false)
const authLink = ref('')

const userList = ref([] as UserJSONResponse[])
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

console.log(userState.students)

const refresh = async () => {
  console.log('test')
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

  // console.log(users)
  //
  // if (users.isLinksExist === false) {
  // }
  // console.log('users ', prepareUserImg(data))
  // userList.value = prepareUserImg(data).data
  console.log('users ', userList.value)
  console.log(users)
  userList.value = users.data

  console.log('users ', users.data)
  console.log('users ', userList.value)
}

let userBuffer
const search = () => {
  userBuffer = userState.students
  console.log('test ', userState.students)

  console.log('start')
  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item =>
    item.attributes.Participant.includes(form.search),
  )
}

const generate = async () => {
  const users = listForCreate
  // loaderState.value = 'Signing users'
  const signatures = sign(users)
  // loaderState.value = 'Creating PDF for users'

  userState.students = await createPDF(signatures)

  // loaderState.value = ''
  // isLoader.value = false

  await router.push(ROUTE_NAMES.timestamp)
}

const updateCode = async (code: string) => {
  isUnauthorized.value = false
  await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
    body: {
      data: {
        code: code,
        name: userState.setting.Name,
      },
    },
  })

  isUnauthorized.value = false
}
const sign = (users: UserJSONResponse[]) => {
  const signature = new Signature(userState.setting.SignKey)
  console.log(users, ' users')
  for (const user of users) {
    console.log(user, ' user')
    if (user.Signature === undefined || user.Signature == '') {
      user.Signature = signature.signMsg(user.Msg)
    }
  }
  return users
}

const prepareUserImg = (users: UserJSONResponse[]) => {
  console.log(users)
  const list: UserJSONResponse[] = users
  console.log('pr')
  for (const user of list) {
    user.Img = 'data:image/png;base64,' + user.CertificateImg.toString()
  }
  console.log('users: ', users)
  return users
}
const createPDF = async (users: UserJSONResponse[]) => {
  const resp = await api.post<UserJSONResponseList>(
    '/integrations/ccp/certificate/',
    {
      body: {
        data: {
          users: users, //todo make better
          address:
            userState.setting.Address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
          url: userState.setting.Url,
          name: userState.setting.Name,
        },
      },
    },
  )
  console.log(resp.data)
  const updatedUsers = prepareUserImg(resp.data)
  userState.students = updatedUsers.data
  return resp.data
}

const updateUsers = async (users: UserJSONResponse[]) => {
  const { data } = await api.put<UserJSONResponseList>(
    '/integrations/ccp/certificate/',
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

  // todo check  error
  userState.students = data.data
}

const autoRefresh = () => {
  console.log('start')

  if (userState.students.length === 0) {
    console.log('refresh')
    refresh()
  }
  console.log('auto: ', userList.value)
  userList.value = userState.students
}

autoRefresh()

console.log(route.params)

const selectItem = (state: boolean, item: UserJSONResponse) => {
  if (state) {
    listForCreate.push(item)
    console.log(listForCreate, 'list')
    generateCount.value = listForCreate.length
    return
  }

  const index = listForCreate.indexOf(item, 0)
  if (index > -1) {
    listForCreate.splice(index, 1)
  }
  generateCount.value = listForCreate.length
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
