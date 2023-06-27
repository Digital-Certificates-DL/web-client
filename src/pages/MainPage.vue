<template>
  <div class="main-page">
    <div class="main-page__info">
      <app-logo class="main-page__logo" />
      <h1 class="main-page__info-title">
        {{ $t('main-page.page-info-title') }}
      </h1>
      <p class="main-page__info-description">
        {{ $t('main-page.page-info-description') }}
      </p>
    </div>
    <div class="main-page__body">
      <div class="main-page__metamask-block">
        <div v-if="!web3Store.provider.isConnected" class="main-page__metamask">
          <p class="main-page__metamask-title">
            {{ $t('main-page.metamask-connect') }}
          </p>
          <p class="main-page__metamask-definition">
            {{ $t('main-page.metamask-description') }}
          </p>
          <app-button
            class="main-page__metamask-btn main-page__btn-connect"
            color="info"
            :text="$t('main-page.metamask-connect-btn')"
            :disabled="web3Store.provider.isConnected"
            @click="connect"
          />
        </div>
        <div v-else class="main-page__metamask">
          <p>
            {{ web3Store.provider.selectedAddress }}
          </p>
          <app-button
            v-if="web3Store.provider.isConnected"
            class="main-page__metamask-btn"
            color="info"
            size="large"
            :text="$t('main-page.metamask-disconnect-btn')"
            @click="web3Store.provider.disconnect"
          />
        </div>
      </div>
      <div class="main-page__endpoints-side">
        <main-nav
          class="main-page__navigation-item"
          color="warning"
          size="large"
          :body="$t('main-page.main-nav-settings-body')"
          :title="$t('main-page.main-nav-settings-title')"
          :description="$t('main-page.main-nav-settings-description')"
          @click="router.push(ROUTE_NAMES.settings)"
        />
        <main-nav
          class="main-page__navigation-item"
          color="info"
          size="large"
          :body="$t('main-page.main-nav-certificates-body')"
          :title="$t('main-page.main-nav-certificates-title')"
          :description="$t('main-page.main-nav-certificates-description')"
          @click="router.push(ROUTE_NAMES.certificates)"
        />
        <main-nav
          class="main-page__navigation-item"
          color="success"
          size="large"
          :title="$t('main-page.main-nav-generation-title')"
          :description="$t('main-page.main-nav-generation-description')"
          :body="$t('main-page.main-nav-generation-body')"
          @click="router.push(ROUTE_NAMES.generate)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, MainNav, AppLogo } from '@/common'

import { useWeb3ProvidersStore } from '@/store'

import { ErrorHandler } from '@/helpers'
import { ROUTE_NAMES } from '@/enums'
import { router } from '@/router'

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
.main-page {
  max-width: var(--page-large);
  margin: auto;
}

.main-page__info {
  display: grid;
  margin-top: toRem(80);
  grid-row: span;
  justify-content: center;
  padding-bottom: toRem(60);
}

.main-page__info-title {
  margin: auto;
  padding: toRem(20);
}

.main-page__logo {
  margin: auto;
  padding: toRem(20);
  font-size: toRem(25);
}

.main-page__body {
  display: flex;
  align-content: center;
  justify-content: space-between;
  background: var(--app-background-gradient);
  opacity: var(--app-background-opacity);
}

.main-page__btn-connect {
  text-align: center;
}

.main-page__metamask {
  display: grid;
  place-content: center;
  border-radius: toRem(8);
  padding: toRem(12);
  width: toRem(652);
  height: toRem(346);
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
  color: var(--text-secondary-light);
  font-size: toRem(20);
}

.main-page__navigation-item {
  max-width: toRem(304);
}

.main-page__card-indicator {
  position: absolute;
  top: toRem(12);
  right: toRem(12);
  width: toRem(12);
  height: toRem(12);
  border-radius: toRem(8);
  background: var(--error-main);

  &--active {
    background: var(--success-main);
  }
}

.main-page__metamask-btn {
  max-width: toRem(200);
  margin: toRem(20) auto;
}

.main-page__info-description {
  font-size: toRem(16);
  max-width: toRem(426);
  text-align: center;
  color: var(--text-primary-light);
}
</style>
