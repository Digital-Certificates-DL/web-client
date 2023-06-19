<template>
  <div v-if="isUnauthorized">
    <auth-modal
      :token-link="authLink"
      v-model:is-shown="isUnauthorized"
      @send-auth-code="updateCode"
    />
  </div>

  <div v-else class="generation">
    <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />

    <div class="generation__title">
      <h2>{{ $t('generation-page.title') }}</h2>
    </div>
    <div class="generation__body">
      <div class="generation__step">
        <p
          class="generation__step-number"
          :class="{ 'generation__step-numner--ready': isReady }"
        >
          {{ $t('generation-page.step-1') }}
        </p>

        <div class="generation__collection-name generation__step-field">
          <p class="generation__subtitle-num">
            {{ $t('generation-page.step-1-description') }}
          </p>
          <input-field
            class="generation__text-input"
            v-model="certificatesInfo.name"
            @input="validateField"
            :class="{ 'generation__step-number--ready': isReady }"
            :label="$t('generation-page.step-1-placeholder')"
            :error-message="getFieldErrorMessage('name')"
          />
        </div>
      </div>

      <div class="generation__step">
        <p
          class="generation__step-number"
          :class="{ 'generation__step-field--ready': isReady }"
        >
          {{ $t('generation-page.step-2') }}
        </p>
        <div class="generation__choose-template-wrp generation__step-field">
          <p class="generation__subtitle-num">
            {{ $t('generation-page.step-2-description') }}
          </p>
          <div
            class="generation__choose-template-list"
            :class="{ 'generation__step-field--ready': isReady }"
          >
            <div class="generation__choose-template"></div>
            <div class="generation__choose-template">
              <div class="generation__choose-template-content">
                <div class="generation__choose-template-icon-wrp">
                  <icon class="generation__choose-template-icon" name="plus" />
                </div>
                <p class="generation__choose-template-title">
                  {{ $t('generation-page.upload-new-template') }}
                </p>
              </div>
            </div>
            <div class="generation__choose-template">
              <div class="generation__choose-template-content">
                <div class="generation__choose-template-icon-wrp">
                  <icon
                    class="generation__choose-template-icon"
                    name="show-more"
                  />
                </div>

                <p class="generation__choose-template-title">
                  {{ $t('generation-page.choose-template') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="generation__step">
        <p
          class="generation__step-number"
          :class="{ 'generation__step-number--ready': isReady }"
        >
          {{ $t('generation-page.step-3') }}
        </p>
        <div class="generation__upload-files generation__step-field">
          <p class="generation__subtitle-num">
            {{ $t('generation-page.step-3-description') }}
          </p>
          <input-field
            class="generation__text-input"
            v-model="certificatesInfo.link"
            :class="{ 'generation__step-field--ready': isReady }"
            :error-message="getFieldErrorMessage('link')"
            :label="$t('generation-page.step-3-placeholder')"
          />
        </div>
      </div>
      <div class="generation__step-field generation__btns">
        <app-button
          class="generation__btn"
          color="info"
          :text="$t('generation-page.start-btn')"
          @click="start"
        />
        <app-button
          class="generation__btn"
          color="info"
          :text="$t('generation-page.cancel-btn')"
          @click="router.push(ROUTE_NAMES.main)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { InputField } from '@/fields'
import { api } from '@/api'
import { AppButton } from '@/common'
import { UserJSONResponse, UserJSONResponseList } from '@/types/user.types'
import { useUserStore } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { Signature } from '@/utils'

import { AuthModal } from '@/common/modals'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'
import { ErrorHandler } from '@/helpers'
import LoaderModal from '@/common/modals/LoaderModal.vue'
import Icon from '@/common/Icon.vue'
const userState = useUserStore()

const isUnauthorized = ref(false)
const authLink = ref('')

const isLoading = ref(false)
const processState = ref('')

// const DEFAULT_KEY = '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW'

const certificatesInfo = reactive({
  name: '',
  link: '',
  table: null,
})

const isReady = ref(false)

// const readyFiled = computed(() => {
//   return isReady.value ? 'generation__step-field--ready' : ''
// })
//
// const readyNumber = computed(() => {
//   return isReady.value ? 'generation__step-number--ready' : ''
// })

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
  isLoading.value = true
  const users = await parsedData(certificatesInfo.link)
  if (!users) {
    isLoading.value = false
    return
  }

  userState.students = users

  await generate(users)
  await router.push({
    name: ROUTE_NAMES.timestamp,
  })
}

const parsedData = async (sheepUrl?: string) => {
  try {
    const { data } = await api.post<UserJSONResponse[]>(
      '/integrations/ccp/users/empty',
      {
        body: {
          data: {
            name: userState.setting.accountName,
            url: sheepUrl || userState.setting.urlGoogleSheet,
          },
        },
      },
    )
    return (data as UserJSONResponse[]) || undefined
  } catch (error) {
    if (error.metadata.link) {
      isUnauthorized.value = true
      authLink.value = error.metadata.link
      return
    }
    ErrorHandler.process(error)
  }
}

const generate = async (items: UserJSONResponse[]) => {
  isLoading.value = true

  processState.value = 'Sign data'

  const signatures = await sign(items)
  processState.value = 'Create pdfs'

  const users = await createPDF(signatures)
  processState.value = ''

  isLoading.value = false

  userState.bufferUserList = users
}

const createPDF = async (users: UserJSONResponse[]) => {
  const { data } = await api.post<UserJSONResponse[]>(
    '/integrations/ccp/certificate/',
    {
      body: {
        data: {
          users: users, //todo make better
          address: userState.setting.userBitcoinAddress,
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

const sign = async (users: UserJSONResponse[]) => {
  const signature = new Signature(userState.setting.signKey)
  for (const user of users) {
    if (!user.signature || user.signature == '') {
      user.signature = signature.signMsg(user.msg)
    }
  }
  return users
}

const prepareUserImg = (users: UserJSONResponse[]) => {
  const list: UserJSONResponse[] = users
  for (const user of list) {
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
}

const updateCode = async (code: string) => {
  try {
    isUnauthorized.value = false
    await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
      body: {
        data: {
          code: code,
          name: userState.setting.accountName,
        },
      },
    })
  } catch (error) {
    ErrorHandler.process(error)
  }
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
  display: flex;
  justify-content: center;
  align-items: center;
  width: toRem(314);
  height: toRem(222);
  background: var(--background-primary-dark);
  border-radius: toRem(12);
  margin-right: toRem(15);
}

.generation__choose-template-title {
  display: flex;
  justify-content: center;
}

.generation__choose-template-icon-wrp {
  display: flex;
  justify-content: center;
}

.generation__choose-template-icon {
  width: toRem(24);
  height: toRem(24);
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
