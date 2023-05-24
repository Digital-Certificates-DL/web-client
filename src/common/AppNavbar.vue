<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />

    <div class="app-navbar__configuration">
      <div class="app-navbar__metamask">
        <app-button
          @click="connect"
          icon-left="metamask"
          :text="preparedAddress || 'Connect'"
          class="app-navbar__btn"
        />
      </div>
      <div class="app-navbar__settings">
        <app-button
          class="app-navbar__btn"
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
import { AppLogo, AppButton } from '@/common'
import { useWeb3ProvidersStore } from '@/store'
import { ref } from 'vue'

const { provider } = useWeb3ProvidersStore()
const preparedAddress = ref('')
const connect = async () => {
  await provider.connect()
  preparedAddress.value =
    provider.selectedAddress!.slice(0, 6) +
    '...' +
    provider.selectedAddress!.slice(-4)
}
</script>

<style lang="scss" scoped>
$box-shadow-r: 0;
$box-shadow-g: 0;
$box-shadow-b: 0;
$box-shadow-a: 0.06;

.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: toRem(24) var(--app-padding-right) toRem(24) var(--app-padding-left);
  background: var(--background-primary-main);
  border-bottom: var(--border-primary-main);
  box-shadow: 0 toRem(4) toRem(16)
    rgba($box-shadow-r, $box-shadow-g, $box-shadow-b, $box-shadow-a);
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
