<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />

    <div class="app-navbar__configuration">
      <app-button
        class="app-navbar__btn app-navbar__metamask"
        color="info"
        :disabled="provider.isConnected"
        :text="preparedAddress || $t('app-navbar.metamask-connect')"
        :icon-left="$icons.metamask"
        @click="connect"
      />

      <app-button
        class="app-navbar__btn app-navbar__settings"
        color="info"
        :icon-left="$icons.settings"
        :route="{
          name: $routes.settings,
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, AppLogo } from '@/common'
import { useWeb3ProvidersStore } from '@/store'
import { onBeforeMount, ref } from 'vue'

const { provider } = useWeb3ProvidersStore()
const preparedAddress = ref('')

const connect = async () => {
  await provider.connect()
  prepareAddress()
}

const prepareAddress = () => {
  if (provider.isConnected) {
    preparedAddress.value =
      provider.selectedAddress!.slice(0, 6) +
      '...' +
      provider.selectedAddress!.slice(-4)
  }
}

onBeforeMount(() => {
  prepareAddress()
})
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
  justify-content: space-between;
  width: toRem(200);
}

.app-navbar__img {
  width: toRem(20);
}

.app-navbar__btn {
  height: toRem(50);
  border-radius: toRem(8);
}
</style>
