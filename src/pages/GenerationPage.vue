<template>
  <div class="generation-page">
    <auth-modal
      v-model:is-shown="isUnauthorized"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />
    <div class="generation-page__title">
      <h2>{{ $t('generation-page.title') }}</h2>
    </div>
    <div class="generation-page__body">
      <div class="generation-page__step">
        <p
          class="generation-page__step-number"
          :class="{ 'generation-page__step-numner--ready': isReady }"
        >
          {{ $t('generation-page.step-1') }}
        </p>

        <div class="generation-page__collection-name generation__step-field">
          <p class="generation-page__subtitle-num">
            {{ $t('generation-page.step-1-description') }}
          </p>
          <input-field
            v-model="nameFieldData"
            class="generation-page__text-input"
            :class="{ 'generation-page__step-number--ready': isReady }"
            :label="$t('generation-page.step-1-placeholder')"
            @input="validateNameField"
          />
        </div>
      </div>

      <div class="generation-page__step">
        <p
          class="generation-page__step-number"
          :class="{ 'generation-page__step-field--ready': isReady }"
        >
          {{ $t('generation-page.step-2') }}
        </p>
        <div
          class="generation-page__choose-template-wrp generation__step-field"
        >
          <p class="generation-page__subtitle-num">
            {{ $t('generation-page.step-2-description') }}
          </p>
          <div
            class="generation-page__choose-template-list"
            :class="{ 'generation-page__step-field--ready': isReady }"
          >
            <div class="generation-page__choose-template"></div>
            <div class="generation-page__choose-template"></div>
            <div class="generation-page__choose-template"></div>
          </div>
        </div>
      </div>
      <div class="generation-page__step">
        <p
          class="generation-page__step-number"
          :class="{ 'generation__step-number--ready': isReady }"
        >
          {{ $t('generation-page.step-3') }}
        </p>
        <div class="generation-page__upload-files generation-page__step-field">
          <p class="generation-page__subtitle-num">
            {{ $t('generation-page.step-3-description') }}
          </p>
          <input-field
            v-model="linkFieldData"
            class="generation-page__text-input"
            :class="{ 'generation-page__step-field--ready': isReady }"
            :label="$t('generation-page.step-3-placeholder')"
            @input="validateLinkField"
          />
        </div>
      </div>
      <div class="generation-page__step-field generation-page__btns">
        <app-button
          class="generation-page__btn"
          color="info"
          size="large"
          :text="$t('generation-page.start-btn')"
          @click="start"
        />
        <app-button
          class="generation-page__btn"
          color="info"
          size="large"
          :text="$t('generation-page.cancel-btn')"
          @click="router.push(ROUTE_NAMES.main)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { InputField } from '@/fields'
import { api } from '@/api'
import { AppButton } from '@/common'
import { Signature } from '@/utils/signature.utils'
import { CertificateJSONResponseList, CertificateJSONResponse } from '@/types'
import { useUserStore } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'

import { AuthModal } from '@/common/modals'
import { ErrorHandler } from '@/helpers'
const userState = useUserStore()

const isNameFieldValid = ref(false)
const isLinkFieldValid = ref(false)

const isUnauthorized = ref(false)
const authLink = ref('')
const DEFAULT_KEY = '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW'

const nameFieldData = ref('')
const linkFieldData = ref('')

const isReady = ref(false)

const validateNameField = () => {
  if (nameFieldData.value) {
    isNameFieldValid.value = true
  }
}

const validateLinkField = () => {
  if (linkFieldData.value) {
    isLinkFieldValid.value = true
  }
}

const start = async () => {
  if (!isLinkFieldValid.value || !isNameFieldValid.value) return
  const users = await parsedData(linkFieldData.value)
  if (!users) {
    return
  }
  const signatures = sign(users)
  await createPDF(signatures)
}
const parsedData = async (sheepUrl?: string) => {
  try {
    const { data } = await api.post<CertificateJSONResponse[]>(
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
    return (data as CertificateJSONResponse[]) || undefined
  } catch (error) {
    if (error.metadata.link) {
      isUnauthorized.value = true
      authLink.value = error.metadata.link
      return
    }
    ErrorHandler.process(error)
  }
}

const sign = (users: CertificateJSONResponse[]) => {
  const signature = new Signature(userState.setting.signKey)
  for (const user of users) {
    if (!user.signature || user.signature == '') {
      user.signature = signature.signMsg(user.msg)
    }
  }
  return users
}

const prepareUserImg = (users: CertificateJSONResponse[]) => {
  const list: CertificateJSONResponse[] = users
  for (const user of list) {
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
}
const createPDF = async (users: CertificateJSONResponse[]) => {
  try {
    const { data } = await api.post<CertificateJSONResponse[]>(
      '/integrations/ccp/certificate/',
      {
        body: {
          data: {
            data: users,
            address: userState.setting.userBitcoinAddress || DEFAULT_KEY,
            url: userState.setting.urlGoogleSheet,
            name: userState.setting.accountName,
          },
        },
      },
    )
    users = prepareUserImg(data)
    userState.students = users
    await router.push(ROUTE_NAMES.certificates)
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const updateCode = async (code: string) => {
  try {
    isUnauthorized.value = false
    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      {
        body: {
          data: {
            code: code,
            name: userState.setting.accountName,
          },
        },
      },
    )
  } catch (error) {
    ErrorHandler.process(error)
  }
}
</script>

<style lang="scss" scoped>
.generation-page {
  width: var(--page-large);
  margin: 0 auto;
}

.generation-page__step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--background-primary-dark);
  border-radius: toRem(30);
  font-size: toRem(14);
  width: toRem(30);
  height: toRem(30);
}

.generation-page__text-input {
  display: block;
  width: toRem(458);
  margin-bottom: toRem(20);
  margin-top: toRem(20);
  padding-left: toRem(20);
}

.generation-page__file-input {
  margin-bottom: toRem(20);
  margin-top: toRem(20);
  width: toRem(314);
  height: toRem(222);
}

.generation-page__step {
  display: flex;
  margin-top: toRem(20);
}

.generation-page__choose-template-list {
  display: flex;
  padding-left: toRem(20);
}

.generation-page__choose-template {
  width: toRem(314);
  height: toRem(222);
  background: var(--background-primary-dark);
  border-radius: toRem(12);
  margin-right: toRem(15);
}

.generation-page__btns {
  display: flex;
  margin-left: toRem(60);
}

.generation-page__btn {
  width: toRem(200);
  margin-right: toRem(16);
}

.generation-page__subtitle-num {
  margin-left: toRem(20);
}
</style>
