<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />

    <div class="app-navbar__configuration">
      <div class="app-navbar__metamask">
        <app-button
          class="app-navbar__btn"
          color="info"
          :text="prepareAddress(
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
import { prepareAddress } from '@/helpers'

const { provider } = useWeb3ProvidersStore()
const preparedAddress = ref('')

const connect = async () => {
  await provider.connect()
  preparedAddress.value = prepareAddress(
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
  box-shadow: 0 toRem(4) toRem(16) rgba(var(--black), 0.06);
  margin-bottom: toRem(20);

  @include respond-to(tablet) {
    flex-wrap: wrap;
  }
}

.app-navbar__logo {
  @include respond-to(xsmall) {
    width: 100%;
    margin-bottom: toRem(24);
  }
}

.app-navbar__configuration {
  display: flex;
}

.app-navbar__img {
  width: toRem(20);
}

.app-navbar__btn {
  height: toRem(50);
  border-radius: toRem(8);
}
</style>
