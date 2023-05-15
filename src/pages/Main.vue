<template>
  <div class="main__page">
    <div class="main__info">
      <app-logo class="main__logo" />
      <h1 class="main__info-name">
        {{ $t('main.page-info-name') }}
      </h1>
      <p class="main__info-description">
        {{ $t('main.page-info-desc') }}
      </p>
    </div>
    <div class="main__body">
      <div class="main__provider-side">
        <div>
          <div v-if="!web3Store.provider.isConnected" class="main__metamask">
            <p class="main__metamask-title">
              {{ $t('main.metamask-connect') }}
            </p>
            <p class="main__metamask-definition">
              {{ $t('main.metamask-desc') }}
            </p>
            <app-button
              class="main__metamask-btn main__btn-connect"
              :text="$t('main.metamask-connect-btn')"
              :color="'info'"
              @click="connect"
              :disabled="web3Store.provider.isConnected"
            />
          </div>
          <div v-else class="main__metamask">
            <p>
              {{ web3Store.provider.selectedAddress }}
            </p>
            <app-button
              v-if="web3Store.provider.isConnected"
              class="main__metamask-btn"
              :text="$t('main.metamask-disconnect-btn')"
              color="info"
              size="large"
              @click="web3Store.provider.disconnect"
            />
          </div>
        </div>
      </div>
      <div class="main__endpoints-side">
        <nav-button
          :title="'Settings'"
          description="Your settings"
          class="main__card"
          color="warning"
          size="large"
          :body="$t('main.page-settings-desc')"
          @click="router.push(ROUTE_NAMES.settings)"
        />
        <nav-button
          :title="'Certificates'"
          description="Your certificates"
          class="main__card"
          color="info"
          size="large"
          :body="$t('main.page-certificates-desc')"
          @click="router.push(ROUTE_NAMES.certificates)"
        />
        <nav-button
          :title="'Generation'"
          description="generate certificates"
          :body="$t('main.page-generation-desc')"
          class="main__card"
          color="success"
          size="large"
          @click="router.push(ROUTE_NAMES.generate)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton } from '@/common'

import { useWeb3ProvidersStore } from '@/store'

import { ErrorHandler } from '@/helpers'
import { ROUTE_NAMES } from '@/enums'
import { router } from '@/router'
import NavButton from '@/common/NavButton.vue'
import AppLogo from '@/common/AppLogo.vue'

const web3Store = useWeb3ProvidersStore()

const connect = async () => {
  try {
    await web3Store.provider.connect()
  } catch (error) {
    ErrorHandler.process(error)
  }
}
</script>

<style lang="scss" scoped>
.main__page {
  max-width: toRem(1400);
  margin: auto;
}
.main__info {
  display: grid;
  margin-top: toRem(80);
  grid-row: span;
  justify-content: center;
  padding-bottom: toRem(60);
}

.main__info-name {
  margin: auto;
  padding: toRem(20);
  //font-size: toRem(25);
}

.main__logo {
  margin: auto;
  padding: toRem(20);
  font-size: toRem(25);
}

.main__body {
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

.main__btn-connect {
  text-align: center;
}

.main__metamask {
  display: grid;
  place-content: center;
  border-radius: toRem(8);
  padding: toRem(12);
  width: toRem(652);
  height: toRem(346);
}

.main__endpoints-side {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRem(80);
  grid-auto-rows: toRem(150);
}

.main__metamask-title {
  font-size: toRem(35);
  margin: auto;
}

.main__metamask-definition {
  text-align: center;
  color: var(--text-secondary-light);
  font-size: toRem(20);
}

.main__card {
  max-width: toRem(304);
}

.main__card-indicator {
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

.main__metamask-btn {
  max-width: toRem(200);
  margin: toRem(20) auto;
  width: 100%;
}

.main__info-description {
  font-size: toRem(16);
  max-width: toRem(426);
  text-align: center;
  color: var(--text-primary-light);
}
</style>
