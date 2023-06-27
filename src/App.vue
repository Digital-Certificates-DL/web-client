<template>
  <div v-if="isAppInitialized" class="app__container">
    <router-view v-slot="{ Component, route }">
      <app-navbar v-if="route.fullPath !== '/main'" />
      <component class="app__main" :is="Component" />
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import { ErrorHandler } from '@/helpers/error-handler'
import { ref } from 'vue'
import { useNotifications } from '@/composables'
import { config } from '@config'
import { PROVIDERS } from '@/enums'

import { useWeb3ProvidersStore } from '@/store'
import AppNavbar from '@/common/AppNavbar.vue'

const web3Store = useWeb3ProvidersStore()
const isAppInitialized = ref(false)
const init = async () => {
  try {
    useNotifications()
    document.title = config.APP_NAME
  } catch (error) {
    isAppInitialized.value = false
    ErrorHandler.process(error)
  }
  isAppInitialized.value = true
}

const initProvider = async () => {
  try {
    useNotifications()
    await web3Store.detectProviders()
    const provider = web3Store.providers.find(
      el => el.name === PROVIDERS.metamask,
    )
    await web3Store.provider.init(provider!)
    document.title = config.APP_NAME
  } catch (error) {
    isAppInitialized.value = false
    ErrorHandler.process(error)
  }
  isAppInitialized.value = true
}

init()
initProvider()
</script>

<style lang="scss" scoped>
.app__container {
  overflow: hidden;
  display: grid;
  grid-template-rows: toRem(85) 1fr max-content;
  flex: 1;
  overflow-y: auto;

  @include respond-to(small) {
    grid-template-rows: max-content 1fr max-content;
  }
}

.app__main {
  padding: 0 var(--app-padding-right) 0 var(--app-padding-left);
}

.fade-enter-active {
  animation: fade-in 0.25s;
}

.fade-leave-active {
  animation: fade-in 0.25s reverse;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
