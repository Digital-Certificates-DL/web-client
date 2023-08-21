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

      <div class="timestamp-item__btns">
        <app-button
          class="timestamp-item__btn"
          @click="emit('open-modal', certificate)"
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
  </div>
</template>

<script setup lang="ts">
import { CertificateJSONResponse } from '@/types'
import { CheckboxField } from '@/fields'
import { ref } from 'vue'
import { AppButton } from '@/common'

const isSelected = ref(false)

const props = defineProps<{
  isShow: boolean
  name: string
  date: string
  certificate: CertificateJSONResponse
}>()

const emit = defineEmits<{
  (e: 'open-modal', certificate: CertificateJSONResponse): boolean
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
  align-items: center;
}

.timestamp-item__body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRem(50);
  width: 100%;
  align-items: center;
}

.timestamp-item__btn-download {
  font-size: toRem(20);
}

.timestamp-item__btns {
  display: flex;
}
</style>
