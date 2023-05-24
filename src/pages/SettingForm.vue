<template>
  <div class="setting-form">
    <div class="setting-form__body">
      <div class="setting-form__info">
        <h2 class="setting-form__title">
          {{ $t('setting-form.page-title') }}
        </h2>
        <p>
          {{ $t('setting-form.page-description') }}
        </p>
      </div>
      <h3 class="setting-form__fields-title">
        {{ $t('setting-form.general-title') }}
      </h3>
      <input-field
        class="setting-form__form-input"
        v-model="form.organizationName"
        :label="$t('setting-form.organization-name-form-label')"
        :error-message="getFieldErrorMessage('org')"
      />
      <input-field
        class="setting-form__form-input"
        v-model="form.accountName"
        :label="$t('setting-form.account-name-form-label')"
        :error-message="getFieldErrorMessage('name')"
      />
      <h3 class="setting-form__fields-title">
        {{ $t('setting-form.sign-key-title') }}
      </h3>
      <input-field
        class="setting-form__form-input"
        v-model="form.bip39MnemonicPhrase"
        :label="$t('setting-form.bitcoin-phrase-form-label')"
        :error-message="getFieldErrorMessage('sendMnemonicPhrase')"
      />
      <input-field
        class="setting-form__form-input"
        v-model="form.urlGoogleSheet"
        :label="$t('setting-form.urlGoogleSheet-form-label')"
        :error-message="getFieldErrorMessage('url')"
      />
      <input-field
        class="setting-form__form-input"
        v-model="form.signKey"
        :label="$t('setting-form.wif-form-label')"
        :error-message="getFieldErrorMessage('signKey')"
      />
      <div class="setting-form__btns">
        <app-button
          class="setting-form__btn"
          color="info"
          :text="$t('setting-form.save-btn-title')"
          @click="save"
        />
        <app-button
          class="setting-form__btn"
          color="info"
          :text="$t('setting-form.cancel-btn-title')"
          :route="{
            name: $routes.main,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { InputField } from '@/fields'
import { reactive } from 'vue'
import { UserJSONResponseList, UserSetting } from '@/types'
import { useUserStore } from '@/store/modules/use-users.modules'
import { useRouter } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { AppButton } from '@/common'
import btc from '@/utils/bitcoin.util'

import { api } from '@/api'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'
import { ErrorHandler } from '@/helpers'

const router = useRouter()
const userState = useUserStore()

const form = reactive({
  accountName: '',
  organizationName: '',
  signKey: '',
  bip39MnemonicPhrase: '',
  urlGoogleSheet: '',
} as UserSetting)

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  name: { required },
  org: { required },
  signKey: { required },
  sendMnemonicPhrase: { required },
  url: { required },
})

const save = async () => {
  if (!isFormValid()) return
  userState.setting = form
  const address = btc.Bitcoin.getAddressFromWIF(form.signKey)

  userState.setting.userBitcoinAddress = address || ''

  try {
    await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
      body: {
        data: {
          code: '',
          name: userState.setting.accountName,
        },
      },
    })
    await router.push(ROUTE_NAMES.main)
  } catch (error) {
    ErrorHandler.process(error)
  }
}
</script>
<style scoped lang="scss">
.setting-form {
  width: var(--page-large);
  margin: auto;
}

.setting-form__body {
  display: grid;
  justify-items: center;
}

.setting-form__info {
  display: grid;
  justify-items: center;
  max-height: toRem(100);
  margin-bottom: toRem(50);
}

.setting-form__form-input {
  margin-bottom: toRem(50);
  width: toRem(458);
}

.setting-form__btns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRem(80);
}

.setting-form__btn {
  width: toRem(100);
  border-radius: toRem(8);
}

.setting-form__fields-title {
  margin-bottom: toRem(30);
}

.setting-form__title {
  margin-bottom: toRem(20);
}
</style>
