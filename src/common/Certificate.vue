<template>
  <div class="certificate">
    <checkbox-field v-show="true" v-model="isSelected" @click="clickItem" />
    <div class="certificate__body">
      <div class="certificate__img-wrp" @click="clickItem">
        <img
          v-if="certificate.signature"
          class="certificate__img"
          :src="certificate.img || '/branding/template.jpg'"
          :alt="$t('certificate.img-alt')"
        />
      </div>
      <p class="certificate__name certificate__text-content">
        {{ certificate.participant }}
      </p>
      <p class="certificate__text-content">
        {{ certificate.courseTitle }}
      </p>
      <p class="certificate__text-content">
        {{ certificate.date }}
      </p>

      <div class="certificate__btns">
        <app-button
          v-if="certificate.signature"
          :text="$t('certificate.mint-btn-text')"
          @click="emit('open-modal', certificate)"
        />
        <app-button
          :text="$t('certificate.select-certificate-btn-text')"
          @click="clickItem"
        />
        <app-button
          v-if="certificate.signature"
          class="timestamp-item__btn-download"
          :icon-right="$icons.download"
          @click="openLink(certificate)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppButton } from '@/common'
import { CertificateJSONResponse } from '@/types'
import { CheckboxField } from '@/fields'

import { ref } from 'vue'

const isSelected = ref(false)

const emit = defineEmits<{
  (e: 'open-modal', user: CertificateJSONResponse): boolean
  (e: 'select', isSelected: boolean, user: CertificateJSONResponse): boolean
}>()

const props = defineProps<{
  isShow: boolean
  certificate: CertificateJSONResponse
}>()

const clickItem = () => {
  isSelected.value = !isSelected.value
  emit('select', isSelected.value, props.certificate)
}

const openLink = (certificate: CertificateJSONResponse) => {
  window.open(
    'https://' + certificate.certificate,
    '_blank',
    'noopener, noreferrer',
  )
}
</script>

<style lang="scss" scoped>
.certificate {
  display: flex;
  align-items: center;
  margin-top: toRem(35);
  padding-bottom: toRem(10);
  border-bottom: var(--border-primary-main) toRem(1) solid;
}

.certificate__body {
  display: grid;
  grid-template-columns: 1fr 2fr 4fr 1fr 3fr;
  gap: toRem(50);
  width: 100%;
  align-items: center;
}

.certificate__img-wrp {
  display: flex;
  align-items: center;
  width: toRem(74);
}

.certificate__img {
  width: 100%;
  border-radius: toRem(4);
  margin-right: toRem(10);

  @include respond-to(large) {
    width: toRem(74);
    border-radius: toRem(4);
  }
}

.timestamp-item__btn-download {
  font-size: toRem(20);
}

.certificate__btns {
  max-width: toRem(200);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.certificate__text-content {
  text-align: center;
}
</style>
