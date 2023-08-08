<template>
  <div class="app-navbar">
    <div class="app-navbar__logo-wrp">
      <app-logo class="app-navbar__logo" />
    </div>

    <div class="app-navbar__configuration">
      <div class="app-navbar__metamask">
        <app-button
          class="app-navbar__btn"
          color="info"
          :text="abbrCenter(
              provider.isConnected,
              provider.selectedAddress!,
            ) || $t('app-navbar.metamask-connect')"
          :icon-left="$icons.metamask"
          @click="connect"
        />
      </div>

      <div class="app-navbar__settings">
        <app-button
          class="app-navbar__btn"
          color="info"
          :icon-left="$icons.settings"
          :route="{
            name: $routes.settings,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, AppLogo } from '@/common'
import { useWeb3ProvidersStore } from '@/store'
import { ref } from 'vue'
import { abbrCenter } from '@/helpers'

const { provider } = useWeb3ProvidersStore()
const preparedAddress = ref('')

const connect = async () => {
  await provider.connect()
  preparedAddress.value = abbrCenter(
    provider.isConnected,
    provider.selectedAddress!,
  )
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

.app-navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: toRem(24) var(--app-padding-right) toRem(24) var(--app-padding-left);
  border-bottom: var(--border-primary-main);
  width: 100%;
}

.app-navbar__logo-wrp {
  max-width: toRem(50);
  width: 100%;
}

.app-navbar__logo {
  @include respond-to(xsmall) {
    width: 100%;
    margin-bottom: toRem(24);
  }
}

.app-navbar__configuration {
  max-width: toRem(200);
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.app-navbar__img {
  width: toRem(20);
}

.app-navbar__btn {
  max-height: toRem(50);
  height: 100%;
  border-radius: toRem(8);
}
</style>
