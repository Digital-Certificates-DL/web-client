<template>
  <div class="setting-page">
    <div class="setting-page__body">
      <div class="setting-page__info">
        <h2 class="setting-page__title">
          {{ $t('setting-page.page-title') }}
        </h2>
        <p>
          {{ $t('setting-page.page-description') }}
        </p>
      </div>
      <setting-form class="setting-page__form" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SettingForm } from '@/forms'
</script>

<style scoped lang="scss">
.setting-page {
  width: var(--page-large);
  margin: 0 auto;
}

.setting-page__title {
  margin-bottom: toRem(20);
}

.setting-page__body {
  display: grid;
  justify-items: center;
}

.setting-page__info {
  display: grid;
  justify-items: center;
  margin-bottom: toRem(30);

  @include respond-to('large') {
    margin-bottom: toRem(23);
  }

  @include respond-to('xmedium') {
    margin-bottom: toRem(15);
  }
}

.setting-page__form {
  max-width: toRem(458);
  width: 100%;
}
</style>
