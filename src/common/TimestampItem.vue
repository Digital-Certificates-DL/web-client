<template>
  <div class="timestamp-item">
    <checkbox-field v-model="isSelected" v-show="isShow" @click="clickItem" />
    <div class="timestamp-item__body">
      <div class="timestamp-item__name">
        <p>{{ name }}</p>
      </div>
      <div class="timestamp-item__date">
        <p>{{ date }}</p>
      </div>

      <app-button
        class="timestamp-item__btn"
        @click="emit('open-modal', true, certificate)"
        :text="$t('timestamp-item.mint-btn-text')"
      />

      <app-button
        class="timestamp-item__btn"
        @click="clickItem"
        :text="$t('timestamp-item.select-certificate-btn-text')"
      />

      <app-button
        class="timestamp-item__btn timestamp-item__btn-download"
        :icon-right="$icons.download"
        @click="openLink(certificate)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CertificateJSONResponse } from '@/types'
import { CheckboxField } from '@/fields'
import { ref } from 'vue'
import { AppButton } from '@/common'

const isSelected = ref(false)

defineProps<{
  isShow: boolean
  name: string
  date: string
  certificate: CertificateJSONResponse
}>()

const emit = defineEmits<{
  (
    e: 'open-modal',
    state: boolean,
    certificate: CertificateJSONResponse,
  ): boolean
  (e: 'select', state: boolean, certificate: CertificateJSONResponse): boolean
}>()

const openLink = (certificate: CertificateJSONResponse) => {
  window.open(
    'https://' + certificate.certificate,
    '_blank',
    'noopener, noreferrer',
  )
}

const clickItem = () => {
  isSelected.value = !isSelected.value
  emit('select', isSelected.value, props.certificate)
}
</script>

<style scoped lang="scss">
.timestamp-item {
  display: flex;
  justify-content: space-between;
  border: var(--border-primary-main), toRem(1), solid;
  border-radius: toRem(8);
  padding: toRem(16);
  align-content: center;
  align-items: center;
}

.timestamp-item__body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.timestamp-item__name,
.timestamp-item__date {
  width: 30%;
  display: flex;
}

.timestamp-item__btn {
  width: toRem(140);
  height: toRem(50);
}

.timestamp-item__btn-download {
  width: toRem(50);
  margin-left: toRem(20);
  font-size: toRem(20);
}
</style>
