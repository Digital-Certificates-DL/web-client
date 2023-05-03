<template>
  <div v-if="isLoader">
    <loader scheme="spinner" class="generation_loader" />
  </div>
  <div v-else-if="isUnauthorized">
    <auth-modal
      :token-link="authLink"
      @close-modal="closeModal"
      @with-code="updateCode"
    />
  </div>
  <div v-else class="generation">
    <app-navbar class="app__navbar" />
    <div class="create_title">
      <h1>{{ $t('generation.title') }}</h1>
    </div>
    <div class="generation__body">
      <div class="generation__step">
        <p class="generation__step-number">
          {{ $t('generation.step1') }}
        </p>

        <div class="create_collection-name generation__step-field">
          <h3 class="generation__subtitle-num">
            {{ $t('generation.step1-description') }}
          </h3>
          <input-field
            class="generation__text-input"
            label="Name"
            type="text"
            v-model="certificatesInfo.Name"
            placeholder="note position(y)"
          />
        </div>
      </div>

      <div class="generation__step">
        <p class="generation__step-number">
          {{ $t('generation.step2') }}
        </p>
        <div class="create_upload_files generation__step-field">
          <h3 class="generation__subtitle-num">
            {{ $t('generation.step2-description') }}
          </h3>
          <input-field
            class="generation__file-input"
            id="image-file"
            type="file"
            label="template"
            v-model="certificatesInfo.Template"
          />
          <!--todo  make better ^-->
        </div>
      </div>
      <div class="generation__step">
        <p class="generation__step-number">
          {{ $t('generation.step3') }}
        </p>
        <div class="create_upload_files generation__step-field">
          <h3 class="generation__subtitle-num">
            {{ $t('generation.step3-description') }}
          </h3>
          <input-field
            class="generation__text-input"
            label="Link"
            type="text"
            v-model="certificatesInfo.Link"
            placeholder="note position(y)"
          />
        </div>
      </div>
      <div class="generation__btns">
        <app-button
          class="generation__btn"
          type="submit"
          text="Start"
          :color="'success'"
          @click="start"
        />
        <app-button
          class="generation__btn"
          type="submit"
          text="Cancel"
          :color="'success'"
          @click="cancel"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import InputField from '@/fields/InputField.vue'
import { api } from '@/api'
import { AppButton, AppNavbar } from '@/common'
import { Signature } from '@/utils/signature.utils'
import {
  UnauthorizedResponse,
  UserJSONResponseList,
  UserJSONResponse,
  UserSetting,
} from '@/types/user.types'
import { useUserStore } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import Loader from '@/common/Loader.vue'
import { defer } from 'lodash-es'
import AuthModal from '@/common/AuthModal.vue'
const userState = useUserStore()

const isLoader = ref(false)
const isUnauthorized = ref(false)
const authLink = ref('')
const loaderState = ref('')

const form = reactive({
  Url: '',
  SignKey: '',
  SendKey: '',
} as UserSetting)

const certificatesInfo = reactive({
  Name: '',
  Template: null,
  Link: '',
  Table: null,
})

const start = async () => {
  defer(() => {
    isLoader.value = false
  })
  isLoader.value = true
  loaderState.value = 'Parsing users'
  const users = await parsedData(certificatesInfo.Link)
  if (users === undefined) {
    return
  }
  loaderState.value = 'Signing users'
  const signatures = sign(users)
  loaderState.value = 'Creating PDF for users'
  await createPDF(signatures)
  loaderState.value = ''
  isLoader.value = false
}
const parsedData = async (sheepUrl?: string) => {
  const resp = await api
    .post<UserJSONResponseList | UnauthorizedResponse>(
      '/integrations/ccp/users/empty',
      {
        data: {
          name: userState.setting.Name,
          url: sheepUrl || userState.setting.Url,
        },
      },
    )
    .then(resp => {
      if (resp.status === 403) {
        return
      }
      return resp
    })
    .catch(err => {
      if (err.response.data.data.attributes.link) {
        isUnauthorized.value = true
        authLink.value = err.response.data.data.attributes.link
      }
    })

  return resp as UserJSONResponseList | undefined
}
const sign = (users: UserJSONResponseList) => {
  const signature = new Signature(form.SignKey || userState.setting.SignKey)
  for (const user of users.data.data) {
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
const createPDF = async (users: UserJSONResponseList) => {
  const resp = await api.post<UserJSONResponseList>(
    '/integrations/ccp/certificate/',
    {
      data: {
        data: users.data, //todo make better
        address:
          userState.setting.Address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
        url: userState.setting.Url || form.Url,
        name: userState.setting.Name,
      },
    },
  )
  users = prepareUserImg(resp.data)
  userState.students = users.data
  await router.push(ROUTE_NAMES.certificates)
}

const cancel = async () => {
  await router.push(ROUTE_NAMES.main)
}

const closeModal = () => {
  isUnauthorized.value = false
}

const updateCode = async (code: string) => {
  isUnauthorized.value = false
  await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
    data: {
      code: code,
      name: userState.setting.Name,
    },
  })

  isUnauthorized.value = false
}
</script>

<style lang="scss">
.generation__step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--background-primary-dark);
  border-radius: toRem(30);
  font-size: toRem(14);
  width: toRem(30);
  height: toRem(30);
}

.generation__step-number--ready {
  background: var(--secondary-dark);
}

.generation__text-input {
  display: block;
  width: toRem(458);
  margin-bottom: toRem(20);
  margin-top: toRem(20);
}

.generation__file-input {
  margin-bottom: toRem(20);
  margin-top: toRem(20);
  width: toRem(314);
  height: toRem(222);
}

.generation__step-field--ready {
  border-left: var(--secondary-dark) toRem(2) solid;
}

.generation__step {
  display: flex;
  margin-top: toRem(20);
}

.generation__btns {
  display: flex;
  justify-content: space-between;
  width: toRem(350);
  margin-left: toRem(80);
}

.generation__subtitle-num {
  margin-left: toRem(20);
}
</style>
