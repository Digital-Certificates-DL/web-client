<template>
  <form class="setting-form" autocomplete="off">
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
        :text="$t('setting-form.save-btn-text')"
        :disabled="!isFormValid"
        @click="save"
      />
      <app-button
        class="setting-form__btn"
        color="info"
        size="large"
        :text="$t('setting-form.cancel-btn-text')"
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
import { UserSetting } from '@/types'
import { useFormValidation } from '@/composables'
import { link, maxLength, mnemonic, required } from '@/validators'
import { ROUTE_NAMES } from '@/enums'
import { useUserStore } from '@/store'
import { AppButton } from '@/common'
import { useRouter } from 'vue-router'
import { Bitcoin } from '@/utils'
import { saveUserSetting } from '@/api'
import { useI18n } from 'vue-i18n'
import { MAX_NAME_LENGTH } from '@/constant'
import { ErrorHandler } from '@/helpers'

const emit = defineEmits<{
  (event: 'error', msg: string): void
}>()

const { t } = useI18n()
const userState = useUserStore()
const router = useRouter()

const form = reactive({
  accountName: userState.userSetting.accountName || '',
  signKey: userState.userSetting.signKey || '',
  bip39MnemonicPhrase: userState.userSetting.bip39MnemonicPhrase || '',
  urlGoogleSheet: userState.userSetting.urlGoogleSheet || '',
} as UserSetting)

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  accountName: { required, maxLength: maxLength(MAX_NAME_LENGTH) },
  signKey: { required },
  bip39MnemonicPhrase: { required, mnemonic },
  urlGoogleSheet: { required, link },
})

const save = async () => {
  if (!isFormValid()) return
  userState.setUserSetting(form)

  try {
    userState.userSetting.userBitcoinAddress = Bitcoin.getAddressFromWIF(
      form.signKey,
    )

    await saveUserSetting(userState.userSetting.accountName)
    await router.push({ name: ROUTE_NAMES.main })
  } catch (error) {
    ErrorHandler.process(error)
    emit('error', t('errors.failed-save-setting'))
  }
}
</script>

<style scoped lang="scss">
.setting-form__form-input {
  margin-bottom: toRem(40);

  @include respond-to(xmedium) {
    margin-bottom: toRem(30);
  }

  @include respond-to(large) {
    margin-bottom: toRem(35);
  }
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
