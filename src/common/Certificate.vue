<template>
  <div class="certificate">
    <checkbox-field
      v-show="true"
      :model-value="isSelected"
      @click="selectItem"
    />
    <div class="certificate__body">
      <div class="certificate__img-wrp" @click="selectItem">
        <img
          v-if="certificate.signature"
          class="certificate__img"
          :src="certificate.img || '/branding/template.jpg'"
          alt="certificate"
        />
        <div v-else class="certificate__img"></div>
        <p class="certificate__name">
          {{ certificate.participant }}
        </p>
      </div>
      <div class="certificate__titles">
        <p>
          {{ certificate.courseTitle }}
        </p>
        <p>
          {{ certificate.date }}
        </p>
      </div>

      <div class="certificate__btns" v-if="certificate.signature !== ''">
        <app-button
          class="certificate__btn"
          :text="$t('certificate.mint-text')"
          @click="emit('open-modal', certificate)"
        />
        <app-button
          class="certificate__btn"
          :text="$t('certificate.select-certificate-btn')"
          @click="selectItem"
        />

        <app-button
          class="certificate__btn certificate__btn-download"
          icon-right="download"
          @click="openLink(certificate)"
        />
      </div>
      <div class="certificate__btns" v-else>
        <app-button
          class="certificate__btn"
          :text="$t('certificate.select-certificate-btn')"
          @click="selectItem"
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

const selectItem = () => {
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
  max-width: var(--page-large);
}

.certificate__body {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.certificate__img-wrp {
  display: flex;
  align-items: center;
}

.certificate__img {
  width: toRem(74);
  border-radius: toRem(4);
  margin-right: toRem(10);

  @include respond-to(large) {
    width: toRem(74);
    border-radius: toRem(4);
  }
}

.certificate__titles {
  display: flex;
  justify-content: space-between;
  width: 40%;
}

.certificate__name {
  width: toRem(150);
}

.certificate__btn {
  width: toRem(140);
  height: toRem(50);
}

.certificate__btn-download {
  width: toRem(50);
  margin-left: toRem(20);
  font-size: toRem(20);
}

.certificate__btns {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 20%;
}
</style>
