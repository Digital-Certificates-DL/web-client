<template>
  <div class="header">
    <div class="header__body">
      <div class="header__logo">
        <h2 @click="goToMain">
          {{ logo }}
        </h2>
      </div>
      <div class="header__configuration">
        <div class="header__metamask">
          <app-button
            @click="connect"
            class="header__btn"
            :text="web3Store.provider.selectedAddress || 'Connect'"
          />
        </div>
        <div class="header__settings">
          <app-button class="header__btn" @click="goToSetting">
            {{ settingIco }}
          </app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { PROVIDERS, ROUTE_NAMES } from '@/enums'
import { useWeb3ProvidersStore } from '@/store'
import { UseProvider, useProvider } from '@/composables'
import { ErrorHandler } from '@/helpers'
import AppButton from '@/common/AppButton.vue'

const logo = 'LOGO'
const settingIco = '&#9881;'

const providers: UseProvider[] = []
const web3Store = useWeb3ProvidersStore()
const goToSetting = async () => {
  await router.push(ROUTE_NAMES.setting)
}

const goToMain = async () => {
  await router.push(ROUTE_NAMES.main)
}
const connect = async () => {
  try {
    await web3Store.detectProviders()

    for (const designatedProvider of web3Store.providers) {
      const provider = useProvider()
      await provider.init(designatedProvider)

      if (provider.selectedProvider.value === PROVIDERS.metamask) {
        await web3Store.provider.init(designatedProvider)
      }

      providers.push(provider)
    }
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
  }
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-content: center;
  min-height: toRem(100);
  padding-bottom: toRem(20);
}

.header__body {
  width: 90%;
  margin: auto;
  display: flex;
  justify-content: space-between;
}

.header__configuration {
  display: flex;
  justify-content: space-between;
}

.header__settings {
  background: #e5e5e5;
  border-radius: toRem(5);
}

.header__btn {
  background: #fafafa;
  color: #9e9e9e;
}
.header__metamask {
  background: #e5e5e5;
  border-radius: toRem(5);
}
</style>
