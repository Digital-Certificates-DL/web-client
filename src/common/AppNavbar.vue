<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />

    <div class="app-navbar__configuration">
      <div class="app-navbar__metamask">
        <app-button @click="connect" class="app-navbar__btn">
          <img class="app-navbar__img" src="/branding/metamask.png" alt="" />
          <p>{{ web3Store.provider.selectedAddress! || 'Connect' }}</p>
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
import { useWeb3ProvidersStore } from '@/store'

const web3Store = useWeb3ProvidersStore()

const connect = async () => {
  await web3Store.provider.connect()
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
