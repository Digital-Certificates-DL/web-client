<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />

    <div class="app-navbar__configuration">
      <div class="app-navbar__metamask">
        <app-button @click="connect" class="app-navbar__btn">
          <img class="app-navbar__img" src="/branding/metamask.png" alt="" />
          <p>{{ web3Store.provider.selectedAddress! || 'Connect' }}</p>
          <!--          todo fix it-->
        </app-button>
      </div>
      <div class="app-navbar__settings">
        <form>
          <app-button class="app-navbar__btn" route="settings">
            <img src="/static/branding/setting.png" alt="setting ico" />
          </app-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppLogo, AppButton } from '@/common'
import { UseProvider, useProvider } from '@/composables'
import { PROVIDERS, ROUTE_NAMES } from '@/enums'
import { ErrorHandler } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'
import { router } from '@/router'

const web3Store = useWeb3ProvidersStore()
const providers: UseProvider[] = []

console.log(!web3Store.provider.selectedAddress)
const connect = async () => {
  // try {
  //   await web3Store.detectProviders()
  //   for (const designatedProvider of web3Store.providers) {
  //     const provider = useProvider()
  //     await provider.init(designatedProvider)
  //
  //     if (provider.selectedProvider.value === PROVIDERS.metamask) {
  //       await web3Store.provider.init(designatedProvider)
  //     }
  //
  //     providers.push(provider)
  //   }
  //   console.log(providers[0])
  // } catch (error) {
  //   ErrorHandler.processWithoutFeedback(error)
  // }
  await web3Store.provider.connect()
  console.log()
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
