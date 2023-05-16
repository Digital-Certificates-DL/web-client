<template>
  <div class="setting">
    <div class="settings__body">
      <div class="settings__info">
        <h3 class="settings__title">
          {{ $t('settings.page-name') }}
        </h3>
        <p>
          {{ $t('settings.title') }}
        </p>
      </div>
      <h3 class="settings__fields-title">
        {{ $t('settings.general-title') }}
      </h3>
      <input-field
        class="settings__form"
        type="text"
        v-model="form.org"
        :label="$t('settings.org-name-form-label')"
        :error-message="getFieldErrorMessage('org')"
      />
      <input-field
        class="settings__form"
        type="text"
        v-model="form.name"
        :label="$t('settings.account-name-form-label')"
        :error-message="getFieldErrorMessage('name')"
      />
      <h3 class="settings__fields-title">
        {{ $t('settings.sign-key-title') }}
      </h3>
      <input-field
        class="settings__form"
        type="text"
        :label="$t('settings.bitcoin-phrase-form-label')"
        v-model="form.sendMnemonicPhrase"
        :error-message="getFieldErrorMessage('sendMnemonicPhrase')"
      />
      <input-field
        class="settings__form"
        type="text"
        v-model="form.url"
        :label="$t('settings.url-form-label')"
        :error-message="getFieldErrorMessage('url')"
      />
      <input-field
        class="settings__form"
        type="text"
        v-model="form.signKey"
        :label="$t('settings.wif-form-label')"
        :error-message="getFieldErrorMessage('signKey')"
      />
      <div class="settings__btns">
        <app-button
          class="settings__btn"
          :text="$t('settings.save-btn-title')"
          :color="'info'"
          @click="save"
        />
        <app-button
          class="settings__btn"
          :text="$t('settings.cancel-btn-title')"
          :color="'info'"
          :route="{
            name: $routes.main,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
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

const router = useRouter()
const userState = useUserStore()

const form = reactive({
  name: '',
  org: '',
  signKey: '',
  sendMnemonicPhrase: '',
  url: '',
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

  userState.setting.address = address || ''

  await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
    body: {
      data: {
        code: '',
        name: userState.setting.name,
      },
    },
  })
  await router.push(ROUTE_NAMES.main)
}
</script>
<style scoped lang="scss">
.settings__body {
  display: grid;
  justify-items: center;
}

.settings__info {
  display: grid;
  justify-items: center;
  max-height: toRem(100);
  margin-bottom: toRem(50);
}

.settings__form {
  margin-bottom: toRem(50);
  width: toRem(458);
}

.settings__btns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRem(80);
}

.settings__btn {
  width: toRem(100);
}

.settings__fields-title {
  margin-bottom: toRem(30);
}

.settings__title {
  margin-bottom: toRem(20);
}
</style>
