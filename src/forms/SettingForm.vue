<template>
  <form class="setting-form">
    <h3 class="setting-form__fields-title">
      {{ $t('setting-form.general-title') }}
    </h3>
    <input-field
      v-model="form.accountName"
      class="setting-form__form-input"
      :label="$t('setting-form.account-name-form-label')"
      :error-message="getFieldErrorMessage('accountName')"
    />
    <h3 class="setting-form__fields-title">
      {{ $t('setting-form.sign-key-title') }}
    </h3>
    <input-field
      v-model="form.bip39MnemonicPhrase"
      class="setting-form__form-input"
      :label="$t('setting-form.bitcoin-phrase-form-label')"
      :error-message="getFieldErrorMessage('bip39MnemonicPhrase')"
    />
    <input-field
      v-model="form.urlGoogleSheet"
      class="setting-form__form-input"
      :label="$t('setting-form.url-form-label')"
      :error-message="getFieldErrorMessage('urlGoogleSheet')"
    />
    <input-field
      v-model="form.signKey"
      class="setting-form__form-input"
      :label="$t('setting-form.wif-form-label')"
      :error-message="getFieldErrorMessage('signKey')"
    />
    <div class="setting-form__btns">
      <app-button
        class="setting-form__btn"
        color="info"
        size="large"
        :text="$t('setting-form.save-btn-title')"
        :disabled="!isFormValid"
        @click="save"
      />
      <app-button
        class="setting-form__btn"
        color="info"
        size="large"
        :text="$t('setting-form.cancel-btn-title')"
        :route="{
          name: $routes.main,
        }"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { InputField } from '@/fields'
import { reactive } from 'vue'
import { CertificateJSONResponseList, UserSetting } from '@/types'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'
import { Bitcoin } from '@/utils'
import { api } from '@/api'
import { ROUTE_NAMES } from '@/enums'
import { ErrorHandler } from '@/helpers'
import { useUserStore } from '@/store'
import { AppButton } from '@/common'
import { useRouter } from 'vue-router'

const userState = useUserStore()
const router = useRouter()

const form = reactive({
  accountName: '',
  signKey: '',
  bip39MnemonicPhrase: '',
  urlGoogleSheet: '',
} as UserSetting)

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  accountName: { required },
  signKey: { required },
  bip39MnemonicPhrase: { required },
  urlGoogleSheet: { required },
})

const save = async () => {
  if (!isFormValid()) return
  userState.userSetting = form
  const address = Bitcoin.getAddressFromWIF(form.signKey)

  userState.userSetting.userBitcoinAddress = address || ''

  try {
    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      {
        body: {
          data: {
            code: '',
            name: userState.userSetting.accountName,
          },
        },
      },
    )
    await router.push(ROUTE_NAMES.main)
  } catch (error) {
    ErrorHandler.process(error)
  }
}
</script>

<style scoped lang="scss">
.setting-form__form-input {
  margin-bottom: toRem(50);
}

.setting-form__btns {
  display: flex;
  justify-content: space-around;
}

.setting-form__btn {
  max-width: toRem(150);
  width: 100%;
  border-radius: toRem(8);
}

.setting-form__fields-title {
  margin-bottom: toRem(30);
  text-align: center;
}
</style>
