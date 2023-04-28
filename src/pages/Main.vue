<template>
  <div class="main-page">
    <div class="main-page__info">
      <span class="main-page__info-logo"> {{ mainPageInfoLogo }} </span>
      <span class="main-page__info-name">{{ mainPageInfoName }}</span>
      <h3 class="main-page__info-description">
        {{ mainPageInfoDesc }}
      </h3>
    </div>
    <div class="main-page__body">
      <div class="main-page__provider-side">
        <template v-if="isLoaded">
          <template v-if="isLoadFailed">
            <error-message :message="$t('web3-page.loading-error-msg')" />
          </template>
          <template v-else>
            <div
              v-if="!metamaskProvider.isConnected.value"
              class="main-page__metamask"
            >
              <p class="main-page__metamask-title">
                {{ metamaskConnect }}
              </p>
              <p class="main-page__metamask-definition">
                {{ metamaskDesc }}
              </p>
              <app-button
                scheme="flat"
                size="small"
                class="web3-page__card-btn web3-page__card-btn-connect"
                :text="'Connect'"
                @click="connect(metamaskProvider)"
                :disabled="metamaskProvider.isConnected.value"
              />
            </div>
            <div v-else class="main-page__metamask">
              <span class="web3-page__txt">
                {{ `chainId: ${metamaskProvider.chainId.value}` }}
              </span>
              <app-button
                scheme="flat"
                size="small"
                class="web3-page__card-btn"
                color="primary"
                :text="metamaskProvider.selectedAddress.value || 'Connect'"
                @click="connect(metamaskProvider)"
                :disabled="metamaskProvider.isConnected.value"
              />
              <app-button
                v-if="metamaskProvider.isConnected.value"
                class="web3-page__card-btn"
                :text="'Disconnect'"
                scheme="flat"
                color="primary"
                size="small"
                @click="metamaskProvider.disconnect"
              />
            </div>
          </template>
        </template>
        <template v-else>
          <loader />
        </template>
      </div>
      <div class="main-page__endpoints-side">
        <nav-button
          :title="'Settings'"
          description="Your settings"
          class="btn"
          body="Ac integer sapien nisl turpis arcu integer. +
           Pellentesque phasellus egestas pharetra quam cursus"
          @click="goToSetting"
        />
        <nav-button
          :title="'Certificates'"
          description="Your certificates"
          class="btn"
          body="Ac integer sapien nisl turpis arcu integer. +
           Pellentesque phasellus egestas pharetra quam cursus"
          @click="goToCertificate"
        />
        <nav-button
          :title="'Generation'"
          description="generate certificates"
          body="Ac integer sapien nisl turpis arcu integer. +
           Pellentesque phasellus egestas pharetra quam cursus"
          class="btn"
          @click="goToGenerate"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, Loader, ErrorMessage } from '@/common'
import { computed, ref } from 'vue'
import { useWeb3ProvidersStore } from '@/store'

import { useProvider } from '@/composables'
import { ErrorHandler } from '@/helpers'
import { UseProvider } from '@/types'
import { PROVIDERS, ROUTE_NAMES } from '@/enums'
import { router } from '@/router'
import NavButton from '@/common/NavButton.vue'

const isLoaded = ref(false)
const isLoadFailed = ref(false)
const providers: UseProvider[] = []
const mainPageInfoLogo = 'LOGO'
const metamaskConnect = 'Connect to MetaMask'
const mainPageInfoName = 'Service name'
const mainPageInfoDesc =
  'Ac integer sapien nisl turpis arcu integer. Pellentesque phasellus\n' +
  '        egestas pharetra quam cursus'

const metamaskDesc =
  'Ac integer sapien nisl turpis arcu integer. Pellentesque\n' +
  '                phasellus egestas pharetra quam cursus'

const web3Store = useWeb3ProvidersStore()

const metamaskProvider = computed(() =>
  providers.find(el => el.selectedProvider.value === PROVIDERS.metamask),
)
const init = async () => {
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
    isLoadFailed.value = true
  }
  isLoaded.value = true
}

const connect = async (provider: UseProvider) => {
  try {
    await provider.connect()
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const goToCertificate = async () => {
  await router.push(ROUTE_NAMES.certificates)
}
const goToSetting = async () => {
  await router.push(ROUTE_NAMES.setting)
}

const goToGenerate = async () => {
  await router.push(ROUTE_NAMES.create)
}

init()
</script>

<style lang="scss" scoped>
.main_page {
  display: flex;
  justify-items: center;
}

.main-page__info {
  display: grid;
  margin-top: toRem(80);
  grid-row: span;
  justify-content: center;
  padding-bottom: toRem(60);
}

.main-page__info-name {
  margin: auto;
  padding: toRem(20);
  font-size: toRem(25);
}

.main-page__svc-info {
  margin-top: toRem(27);
  display: block;
  place-items: center;
}

.main-page__info-logo {
  margin: auto;
  padding: toRem(20);
  font-size: toRem(25);
}

.main-page__body {
  display: flex;
  align-content: center;
  justify-content: space-between;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(143, 189, 255, 0.38) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0.6;
}

.web3-page__card-btn-connect {
  text-align: center;
}

.main-page__metamask {
  display: grid;
  place-content: center;
  border: toRem(1) solid var(--border-primary-main);
  border-radius: toRem(8);
  padding: toRem(12);
  width: toRem(642);
  height: toRem(432);
}

.main-page__endpoints-side {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRem(80);
  grid-auto-rows: toRem(150);
}

.main-page__metamask-title {
  font-size: toRem(35);
  margin: auto;
}

.main-page__metamask-definition {
  text-align: center;
  font-size: toRem(20);
}

.btn {
  min-width: toRem(200);
  min-height: toRem(200);
  padding: toRem(40);
}

.web3-page__card {
  position: relative;
  display: grid;
  gap: toRem(8);
  border: toRem(1) solid var(--border-primary-main);
  border-radius: toRem(8);
  padding: toRem(12);
}

.web3-page__card-indicator {
  position: absolute;
  top: toRem(12);
  right: toRem(12);
  width: toRem(12);
  height: toRem(12);
  border-radius: 50%;
  background: var(--error-main);

  &--active {
    background: var(--success-main);
  }
}

.web3-page__card-btn {
  width: 100%;
}

.main-page__info-description {
  font-size: toRem(16);
  color: var(--success-dark);
}

.nav-button {
  display: block;
  width: toRem(458);
}
</style>
