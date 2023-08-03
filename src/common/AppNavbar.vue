<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />

    <div class="app-navbar__configuration">
      <app-button
        class="app-navbar__btn"
        color="info"
        :text="
          abbrCenter(provider.selectedAddress) ||
          $t('app-navbar.metamask-connect')
        "
        :icon-left="$icons.metamask"
        @click="connect"
      />

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
</template>

<script lang="ts" setup>
import { AppButton, AppLogo } from '@/common'
import { useWeb3ProvidersStore } from '@/store'
import { abbrCenter } from '@/helpers'

const { provider } = useWeb3ProvidersStore()

const connect = async () => {
  await provider.connect()
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
  align-items: center;
  max-height: toRem(50);
}

.app-navbar__img {
  width: toRem(20);
  height: 100%;
}

.app-navbar__btn {
  border-radius: toRem(8);
  height: 100%;
  margin: toRem(10);
}
</style>
