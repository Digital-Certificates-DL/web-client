<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />

    <div class="app-navbar__configuration">
      <app-button
        class="app-navbar__btn"
        color="info"
        :text="
          abbrCenter(web3Store.provider.selectedAddress, 6) ||
          $t('app-navbar.metamask-connect')
        "
        :icon-left="$icons.metamask"
        @click="connect"
      />

      <app-button
        class="app-navbar__btn"
        color="info"
        :icon-left="$icons.settings"
        @click="openSettingsModal"
      />
    </div>
    <settings-modal v-model:is-shown="isSettingModelShown" />
  </div>
</template>

<script lang="ts" setup>
import { AppButton, AppLogo, SettingsModal } from '@/common'
import { useWeb3ProvidersStore } from '@/store'
import { abbrCenter } from '@/helpers'
import { ref } from 'vue'

const isSettingModelShown = ref(false)
const web3Store = useWeb3ProvidersStore()

const connect = async () => {
  await web3Store.provider.connect()
}

const openSettingsModal = () => {
  isSettingModelShown.value = true
}
</script>

<style lang="scss" scoped>
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: toRem(24) var(--app-padding-right) toRem(24) var(--app-padding-left);
  background: var(--background-primary-main);
  border-bottom: var(--border-primary-main);
  box-shadow: 0 toRem(4) toRem(16) rgba(var(--black-rgb), 0.06);
  margin-bottom: toRem(20);
}

.app-navbar__logo {
  max-width: toRem(50);
  width: 100%;

  @include respond-to(xsmall) {
    margin-bottom: toRem(24);
  }
}

.app-navbar__configuration {
  display: flex;
  align-items: center;
  max-height: toRem(50);
}

.app-navbar__btn {
  border-radius: toRem(8);
  height: 100%;
  margin: toRem(10);
}
</style>
