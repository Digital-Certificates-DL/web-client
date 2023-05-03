<template>
  <div class="main-page">
    <div class="main__info">
      <app-logo class="main__logo" />
      <span class="main__info-name">{{ $t('main.page-info-name') }}</span>
      <h3 class="main__info-description">
        {{ $t('main.page-info-desc') }}
      </h3>
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
              scheme="flat"
              size="small"
              class="main__metamask-btn main__btn-connect"
              :text="'Connect'"
              @click="connect"
              :disabled="web3Store.provider.isConnected"
            />
          </div>
          <div v-else class="main__metamask">
            <app-button
              scheme="flat"
              size="small"
              class="main__metamask-btn"
              color="primary"
              :text="web3Store.provider.selectedAddress || 'Connect'"
              @click="connect"
              :disabled="web3Store.provider.isConnected"
            />
            <app-button
              v-if="web3Store.provider.isConnected"
              class="main__metamask-btn"
              :text="'Disconnect'"
              scheme="flat"
              color="primary"
              size="small"
              @click="web3Store.provider.disconnect"
            />
          </div>
        </div>
      </div>
      <div class="main__endpoints-side">
        <main-nav
          :title="'Settings'"
          description="Your settings"
          class="main__btn"
          color="warning"
          body="Ac integer sapien nisl turpis arcu integer.
           Pellentesque phasellus egestas pharetra quam cursus"
          @click="router.push(ROUTE_NAMES.settings)"
        />
        <main-nav
          :title="'Certificates'"
          description="Your certificates"
          class="main__btn"
          color="info"
          body="Ac integer sapien nisl turpis arcu integer.
           Pellentesque phasellus egestas pharetra quam cursus"
          @click="router.push(ROUTE_NAMES.certificates)"
        />
        <main-nav
          :title="'Generation'"
          description="generate certificates"
          body="Ac integer sapien nisl turpis arcu integer.
           Pellentesque phasellus egestas pharetra quam cursus"
          class="main__btn"
          color="success"
          @click="router.push(ROUTE_NAMES.generate)"
        />

        <main-nav
          :title="'Template'"
          body="Ac integer sapien nisl turpis arcu integer.
           Pellentesque phasellus egestas pharetra quam cursus "
          description="generate certificates"
          class="main__btn"
          color="error"
          @click="router.push(ROUTE_NAMES.template)"
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
// import NavButton from '@/common/NavButton.vue'
import AppLogo from '@/common/AppLogo.vue'
import MainNav from '@/common/MainNav.vue'

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
.main_page {
  display: flex;
  justify-items: center;
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
  font-size: toRem(25);
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
  width: toRem(642);
  height: toRem(432);
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

.main__btn {
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
  width: 100%;
}

.main__info-description {
  font-size: toRem(16);
  color: var(--text-primary-light);
}
</style>
