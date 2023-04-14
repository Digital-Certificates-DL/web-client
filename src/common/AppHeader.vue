<template>
  <div class="header">
    <div class="header_logo">
      <h2>{{ logo }}</h2>
    </div>
    <div class="header_configuration">
      <div class="header_metamask">
        {{ metamask }}
        <button @click="connect"></button>
      </div>
      <div class="header_settings">
        <button @click="goToSetting">
          {{ settings }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'

const logo = 'LOGO'
const metamask = 'Metamask'
const settings = 'settings'
const goToSetting = async () => {
  await router.push(ROUTE_NAMES.setting)
}
const connect = () => {
  //   todo add metamask connector
}
</script>

<style scoped lang="scss">
.header {
  width: 90%;
  margin: auto;
  display: flex;
  justify-content: space-between;
}

.header_settings {
  background: #e5e5e5;
  border-radius: toRem(5);
}

.header_metamask {
  background: #e5e5e5;
  border-radius: toRem(5);
}
</style>
