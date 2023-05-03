<template>
  <div class="setting">
    <app-navbar />
    <div class="setting_body">
      <div class="setting__info">
        <h1 class="setting__title">
          {{ $t('settings.page-name') }}
        </h1>
        <p>
          {{ $t('settings.title') }}
        </p>
      </div>
      <h1 class="settings__fields-title">
        {{ $t('settings.general-title') }}
      </h1>
      <input-field
        class="settings__form"
        label="Name of organization"
        type="text"
        v-model="form.Org"
      />
      <input-field
        label="Account name"
        class="settings__form"
        type="text"
        v-model="form.Name"
      />
      <h1 class="settings__fields-title">
        {{ $t('settings.general-title') }}
      </h1>
      <input-field
        label="Bitcoin Timestamping Mnemonic Phrase"
        class="settings__form"
        type="text"
        v-model="form.SendMnemonicPhrase"
      />
      <input-field
        label="Google Sheet URL"
        class="settings__form"
        type="text"
        v-model="form.Url"
      />
      <input-field
        label="Bitcoin Corporate Signing Key (WIF)"
        class="settings__form"
        type="text"
        v-model="form.SignKey"
      />
      <div class="settings__btns">
        <app-button
          text="Save"
          size="medium"
          :color="'success'"
          @click="save"
        />
        <app-button
          text="Cancel"
          size="medium"
          :color="'success'"
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
import AppButton from '@/common/AppButton.vue'
import btc from '@/utils/bitcoin.util'

import { api } from '@/api'
import { AppNavbar } from '@/common'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'

const router = useRouter()
const userState = useUserStore()

const form = reactive({
  Name: '',
  Org: '',
  SignKey: '',
  SendMnemonicPhrase: '',
  Url: '',
} as UserSetting)

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  Name: { required },
  Org: { required },
  SignKey: { required },
  SendMnemonicPhrase: { required },
  Url: { required },
})

const save = async () => {
  if (!isFormValid) return
  userState.setting = form
  const address = btc.Bitcoin.getAddressFromWIF(form.SignKey)

  userState.setting.Address = address || ''

  await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
    body: {
      data: {
        code: '',
        name: userState.setting.Name,
      },
    },
  })
  await router.push(ROUTE_NAMES.main)
}
</script>
<style scoped lang="scss">
.setting_body {
  display: grid;
  justify-items: center;
}

.setting__info {
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

.settings__fields-title {
  margin-bottom: toRem(30);
}

.setting__title {
  margin-bottom: toRem(20);
}
</style>
