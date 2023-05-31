<template>
  <form action="">
    <h3 class="setting-form__title">
      {{ $t('setting-form.general-title') }}
    </h3>
    <input-field
      class="setting-form__form-input"
      v-model="form.organizationName"
      :label="$t('setting-form.organization-name-form-label')"
      :error-message="getFieldErrorMessage('organizationName')"
    />
    <input-field
      class="setting-form__form-input"
      v-model="form.accountName"
      :label="$t('setting-form.account-name-form-label')"
      :error-message="getFieldErrorMessage('accountName')"
    />
    <h3 class="setting-form__title">
      {{ $t('setting-form.sign-key-title') }}
    </h3>
    <input-field
      class="setting-form__form-input"
      v-model="form.bip39MnemonicPhrase"
      :label="$t('setting-form.bitcoin-phrase-form-label')"
      :error-message="getFieldErrorMessage('bip39MnemonicPhrase')"
    />
    <input-field
      class="setting-form__form-input"
      v-model="form.urlGoogleSheet"
      :label="$t('setting-form.url-form-label')"
      :error-message="getFieldErrorMessage('urlGoogleSheet')"
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
        @click="saveUserData"
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
  </form>
</template>

<script setup lang="ts">
import { InputField } from '@/fields'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'
import { reactive } from 'vue'
import { UserJSONResponse, UserSetting } from '@/types'
import { SettingForm } from '@/forms/index'
import { AppButton } from '@/common'

const form = reactive({
  accountName: '',
  organizationName: '',
  signKey: '',
  bip39MnemonicPhrase: '',
  urlGoogleSheet: '',
} as UserSetting)

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  accountName: { required },
  organizationName: { required },
  signKey: { required },
  bip39MnemonicPhrase: { required },
  urlGoogleSheet: { required },
})

const emit = defineEmits<{
  (e: 'save-user-data', formData: UserSetting): void
}>()

const saveUserData = () => {
  if (!isFormValid()) return
  console.log('send')
  emit('save-user-data', form)
}
</script>

<style scoped lang="scss">
.setting-form__fields-title {
  margin-bottom: toRem(30);

  @include respond-to(large) {
    margin-bottom: toRem(10);
  }
}

.setting-form__form-input {
  margin-bottom: toRem(50);
  width: toRem(458);

  @include respond-to(large) {
    margin-bottom: toRem(40);
  }

  @include respond-to(xmedium) {
    margin-bottom: toRem(30);
    width: toRem(358);
  }
}

.setting-form__title {
  margin-bottom: toRem(20);
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
</style>
