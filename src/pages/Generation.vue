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
      <h2>{{ $t('generation.title') }}</h2>
    </div>
    <div class="generation__body">
      <div class="generation__step">
        <p class="generation__step-number" :class="readyNumber">
          {{ $t('generation.step1') }}
        </p>

        <div class="generation__collection-name generation__step-field">
          <p class="generation__subtitle-num">
            {{ $t('generation.step1-description') }}
          </p>
          <input-field
            class="generation__text-input"
            type="text"
            v-model="certificatesInfo.name"
            @input="validateField"
            :class="readyFiled"
            :label="$t('generation.step1-placeholder')"
            :error-message="getFieldErrorMessage('name')"
          />
        </div>
      </div>

      <div class="generation__step">
        <p class="generation__step-number" :class="readyNumber">
          {{ $t('generation.step2') }}
        </p>
        <div class="generation__choose-template-wrp generation__step-field">
          <p class="generation__subtitle-num">
            {{ $t('generation.step2-description') }}
          </p>
          <div class="generation__choose-template-list" :class="readyFiled">
            <div class="generation__choose-template"></div>
            <div class="generation__choose-template"></div>
            <div class="generation__choose-template"></div>
            <!--todo  make better ^-->
          </div>
        </div>
      </div>
      <div class="generation__step">
        <p class="generation__step-number" :class="readyNumber">
          {{ $t('generation.step3') }}
        </p>
        <div class="generation__upload-files generation__step-field">
          <p class="generation__subtitle-num">
            {{ $t('generation.step3-description') }}
          </p>
          <input-field
            class="generation__text-input"
            type="text"
            v-model="certificatesInfo.link"
            :class="readyFiled"
            :error-message="getFieldErrorMessage('link')"
            :label="$t('generation.step3-placeholder')"
          />
        </div>
      </div>
      <div class="generation__step-field generation__btns">
        <app-button
          class="generation__btn"
          type="submit"
          :text="$t('generation.start-btn')"
          :color="'success'"
          @click="start"
        />
        <app-button
          class="generation__btn"
          type="submit"
          :text="$t('generation.cancel-btn')"
          :color="'success'"
          @click="router.push(ROUTE_NAMES.main)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
import InputField from '@/fields/InputField.vue'
import { api } from '@/api'
import { AppButton } from '@/common'
import { Signature } from '@/utils/signature.utils'
import { UserJSONResponseList, UserJSONResponse } from '@/types/user.types'
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
  name: '',
  link: '',
  table: null,
})

const isReady = ref(false)

const readyFiled = computed(() => {
  return isReady.value ? 'generation__step-field--ready' : ''
})

const readyNumber = computed(() => {
  return isReady.value ? 'generation__step-number--ready' : ''
})

const validateField = () => {
  if (isFormValid()) {
    isReady.value = true
    return
  }
  isReady.value = false
}

const { getFieldErrorMessage, isFormValid } = useFormValidation(
  certificatesInfo,
  {
    name: { required },
    link: { required },
  },
)

const start = async () => {
  if (!isFormValid) return
  const users = await parsedData(certificatesInfo.link)
  if (users === undefined) {
    return
  }
  const signatures = sign(users)
  await createPDF(signatures)
}
const parsedData = async (sheepUrl?: string) => {
  const resp = await api
    .post<UserJSONResponse[]>('/integrations/ccp/users/empty', {
      body: {
        data: {
          name: userState.setting.name,
          url: sheepUrl || userState.setting.url,
        },
      },
    })
    .catch(err => {
      if (err.metadata.link) {
        isUnauthorized.value = true
        authLink.value = err.metadata.link
      }
    })

  return resp as UserJSONResponseList | undefined
}

const sign = (users: UserJSONResponseList) => {
  const signature = new Signature(userState.setting.signKey)
  for (const user of users.data) {
    if (user.Signature === undefined || user.Signature == '') {
      user.Signature = signature.signMsg(user.Msg)
    }
  }
  return users
}

const prepareUserImg = (users: UserJSONResponseList) => {
  const list: UserJSONResponse[] = users.data
  for (const user of list) {
    user.Img = 'data:image/png;base64,' + user.CertificateImg.toString()
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
            userState.setting.address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
          url: userState.setting.url,
          name: userState.setting.name,
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
        name: userState.setting.name,
      },
    },
  })

  isUnauthorized.value = false
}
</script>

<style lang="scss" scoped>
.generation {
  width: var(--page-large);
  margin: 0 auto;
}

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

.generation__text-input {
  display: block;
  width: toRem(458);
  margin-bottom: toRem(20);
  margin-top: toRem(20);
  padding-left: toRem(20);
}

.generation__file-input {
  margin-bottom: toRem(20);
  margin-top: toRem(20);
  width: toRem(314);
  height: toRem(222);
}

.generation__step {
  display: flex;
  margin-top: toRem(20);
}

.generation__choose-template-list {
  display: flex;
  padding-left: toRem(20);
}

.generation__choose-template {
  width: toRem(314);
  height: toRem(222);
  background: var(--background-primary-dark);
  border-radius: toRem(12);
  margin-right: toRem(15);
}

.generation__btns {
  display: flex;
  margin-left: toRem(60);
}

.generation__btn {
  width: toRem(200);
  margin-right: toRem(16);
}

.generation__subtitle-num {
  margin-left: toRem(20);
}

.generation__step-field--ready {
  border-left: var(--secondary-dark) toRem(2) solid;
}

.generation__step-number--ready {
  background: var(--secondary-dark);
  color: var(--white);
}
</style>
