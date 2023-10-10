<template>
  <div class="setting-page">
    <div class="setting-page__body">
      <div class="setting-page__info">
        <h2 class="setting-page__title">
          {{ $t('setting-page.page-title') }}
        </h2>
        <p class="setting-page__description">
          {{ $t('setting-page.page-description') }}
        </p>
      </div>
      <setting-form class="setting-page__form" @error="onError" />
    </div>

    <error-modal v-model:is-shown="isErrorModalShown" :message="errorMsg" />
  </div>
</template>

<script lang="ts" setup>
import { SettingForm } from '@/forms'
import { ErrorModal } from '@/common'

import { ref } from 'vue'

const isErrorModalShown = ref(false)
const errorMsg = ref('')

const onError = (msg: string) => {
  errorMsg.value = msg
  isErrorModalShown.value = true
}
</script>

<style scoped lang="scss">
.setting-page {
  width: 100%;
  margin: 0 auto;
}

.setting-page__title {
  text-align: center;
  margin-bottom: toRem(20);
}

.setting-page__body {
  display: grid;
  justify-items: center;
}

.setting-page__description {
  text-align: center;
}

.setting-page__info {
  display: grid;
  justify-items: center;
  margin-bottom: toRem(30);

  @include respond-to(large) {
    margin-bottom: toRem(23);
  }

  @include respond-to(xmedium) {
    margin-bottom: toRem(15);
  }
}

.setting-page__form {
  max-width: toRem(458);
  width: 100%;
}
</style>
