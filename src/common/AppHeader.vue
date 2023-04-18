<template>
  <div class="header">
    <div class="header__body">
      <div class="header_logo">
        <h2 @click="goToMain">
          {{ logo }}
        </h2>
      </div>
      <div class="header_configuration">
        <div class="header_metamask">
          <app-button
            @click="connect"
            :text="web3Store.provider.selectedAddress || 'Connect'"
          />
        </div>
        <div class="header_settings">
          <button @click="goToSetting">
             &#9881;
          </button>
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

.header_configuration {
  display: flex;
  justify-content: space-between;
}

.header_settings {
  background: #e5e5e5;
  border-radius: toRem(5);
}

.header_metamask {
  background: #e5e5e5;
  //height: toRem(30);
  //margin: auto;
  border-radius: toRem(5);
}
</style>
