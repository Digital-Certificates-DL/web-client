<template>
  <div v-if="isUnauthorized">
    <auth-modal
      :token-link="authLink"
      @close-modal="closeModal"
      @with-code="updateCode"
    />
  </div>
  <div v-else class="generation">
    <div class="generation__title">
      <h1>{{ $t('generation.title') }}</h1>
    </div>
    <div class="generation__body">
      <div class="generation__step">
        <p class="generation__step-number">
          {{ $t('generation.step1') }}
        </p>

        <div class="generation__collection-name generation__step-field">
          <h3 class="generation__subtitle-num">
            {{ $t('generation.step1-description') }}
          </h3>
          <input-field
            class="generation__text-input"
            label="Name"
            type="text"
            v-model="certificatesInfo.Name"
            :error-message="getFieldErrorMessage('name')"
          />
        </div>
      </div>

      <div class="generation__step">
        <p class="generation__step-number">
          {{ $t('generation.step2') }}
        </p>
        <div class="generation__upload-files generation__step-field">
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
        <div class="generation__upload-files generation__step-field">
          <h3 class="generation__subtitle-num">
            {{ $t('generation.step3-description') }}
          </h3>
          <input-field
            class="generation__text-input"
            label="Link"
            type="text"
            v-model="certificatesInfo.Link"
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
          @click="router.push(ROUTE_NAMES.main)"
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
} from '@/types/user.types'
import { useUserStore } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'

import AuthModal from '@/common/modals/AuthModal.vue'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'
const userState = useUserStore()

const isUnauthorized = ref(false)
const authLink = ref('')

const certificatesInfo = reactive({
  Name: '',
  Template: null,
  Link: '',
  Table: null,
})

const { getFieldErrorMessage, isFormValid } = useFormValidation(
  certificatesInfo,
  {
    Name: { required },
  },
)

const start = async () => {
  if (!isFormValid) return
  const users = await parsedData(certificatesInfo.Link)
  if (users === undefined) {
    return
  }
  const signatures = sign(users)
  await createPDF(signatures)
}
const parsedData = async (sheepUrl?: string) => {
  const resp = await api
    .post<UserJSONResponseList | UnauthorizedResponse>(
      '/integrations/ccp/users/empty',
      {
        body: {
          data: {
            name: userState.setting.Name,
            url: sheepUrl || userState.setting.Url,
          },
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
  const signature = new Signature(userState.setting.SignKey)
  for (const user of users.data) {
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
      body: {
        data: {
          data: users.data,
          address:
            userState.setting.Address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
          url: userState.setting.Url,
          name: userState.setting.Name,
        },
      },
    },
  )
  users = prepareUserImg(resp.data)
  userState.students = users.data
  await router.push(ROUTE_NAMES.certificates)
}

const closeModal = () => {
  isUnauthorized.value = false
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
