<template>
  <div class="main__page">
    <div class="main__info">
      <app-logo class="main__logo" />
      <h1 class="main__info-name">
        {{ $t('main-page.page-info-name') }}
      </h1>
      <p class="main__info-description">
        {{ $t('main-page.page-info-description') }}
      </p>
    </div>
    <div class="main__body">
      <div class="main__metamask-block">
        <div v-if="!provider.isConnected" class="main__metamask">
          <p class="main__metamask-title">
            {{ $t('main-page.metamask-connect') }}
          </p>
          <p class="main__metamask-definition">
            {{ $t('main-page.metamask-description') }}
          </p>
          <app-button
            class="main__metamask-btn main__btn-connect"
            color="info"
            :text="$t('main-page.metamask-connect-btn')"
            :disabled="provider.isConnected"
            @click="connect"
          />
        </div>
        <div v-else class="main__metamask">
          <p>
            {{ provider.selectedAddress }}
          </p>
          <app-button
            v-if="provider.isConnected"
            class="main__metamask-btn"
            color="info"
            size="large"
            :text="$t('main-page.metamask-disconnect-btn')"
            @click="provider.disconnect"
          />
        </div>
      </div>
      <div class="main__endpoints-side">
        <main-nav
          class="main__navigation-item"
          color="warning"
          size="large"
          :body="$t('main-page.main-nav-settings-body')"
          :title="$t('main-page.main-nav-settings-title')"
          :description="$t('main-page.main-nav-settings-description')"
          :route="{
            name: $routes.settings,
          }"
        />

        <main-nav
          :title="$t('main-page.main-nav-home-title')"
          color="success"
          :description="$t('main-page.main-nav-home-description')"
          :body="$t('main-page.main-nav-home-body')"
          :route="{
            name: $routes.home,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton } from '@/common'

import { useWeb3ProvidersStore } from '@/store'

import { ErrorHandler } from '@/helpers'

import { AppLogo, MainNav } from '@/common'

const { provider } = useWeb3ProvidersStore()

const connect = async () => {
  try {
    await provider.connect()
  } catch (error) {
    ErrorHandler.process(error)
  }
}
</script>

<style lang="scss" scoped>
$opacity: 0.6;

.main__page {
  max-width: var(--page-large);
  margin: auto;
}

.main__info {
  display: grid;
  margin-top: toRem(80);
  grid-row: span;
  justify-content: center;
  padding-bottom: toRem(60);

  @include respond-to(medium) {
    margin-top: toRem(60);
    padding-bottom: toRem(40);
  }

  @include respond-to(xmedium) {
    margin-top: toRem(70);
    padding-bottom: toRem(50);
  }
}

.main__info-name {
  margin: auto;
  padding: toRem(20);
}

.main__logo {
  margin: auto;
  padding: toRem(20);
  font-size: toRem(25);
}

.main__body {
  display: flex;
  justify-content: space-between;
  background: var(--app-background-gradient);
  opacity: var(--app-background-opacity);
}

.main__btn-connect {
  text-align: center;
}

.main__provider-side {
  display: flex;
  align-items: center;
}

.main__metamask {
  display: grid;
  place-content: center;
  border-radius: toRem(8);
  padding: toRem(12);
  max-width: toRem(652);
  max-height: toRem(346);

  @include respond-to(medium) {
    padding: toRem(12);
    max-width: toRem(452);
    max-height: toRem(246);
  }

  @include respond-to(xmedium) {
    padding: toRem(12);
    max-width: toRem(502);
    max-height: toRem(300);
  }
}

.main__endpoints-side {
  display: grid;
  margin-left: toRem(10);
  grid-template-columns: repeat(2, 1fr);
  gap: toRem(80);
  grid-auto-rows: toRem(150);
}

.main__metamask-block {
  width: 100%;
}

.main__metamask-title {
  font-size: toRem(35);
  margin: auto;

  @include respond-to(xmedium) {
    font-size: toRem(27);
  }
}

.main__metamask-definition {
  text-align: center;
  color: var(--text-secondary-light);
  font-size: toRem(20);

  @include respond-to(xmedium) {
    font-size: toRem(14);
  }
}

.main__navigation-item {
  max-width: toRem(304);

  @include respond-to(xmedium) {
    width: toRem(250);
  }
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
