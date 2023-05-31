<template>
  <div class="setting-page">
    <div class="setting-page__body">
      <div class="setting-page__info">
        <h3 class="setting-page__title">
          {{ $t('setting-page.page-title') }}
        </h3>
        <p>
          {{ $t('setting-page.page-description') }}
        </p>
      </div>

      <setting-form @save-user-data="saveUserData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UserJSONResponseList, UserSetting } from '@/types'
import { useUserStore } from '@/store'
import { useRouter } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import btc from '@/utils/bitcoin.util'

import { api } from '@/api'
import { ErrorHandler } from '@/helpers'
import { SettingForm } from '@/forms'

const router = useRouter()
const { $state, initSettings } = useUserStore()

const saveUserData = async (userData: UserSetting) => {
  initSettings(userData)
  const address = btc.Bitcoin.getAddressFromWIF(userData.signKey)

  $state.setting.userBitcoinAddress = address || ''

  try {
    await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
      body: {
        data: {
          code: '',
          name: $state.setting.accountName,
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
.setting-page {
  max-width: var(--page-large);
  margin: 0 auto;
}

.setting-page__body {
  display: grid;
  justify-items: center;
}

.setting-page__info {
  display: grid;
  justify-items: center;
  max-height: toRem(100);
  margin-bottom: toRem(50);
}

.setting-page__fields-title {
  margin-bottom: toRem(30);
}

.setting-page__title {
  margin-bottom: toRem(20);
}
</style>
