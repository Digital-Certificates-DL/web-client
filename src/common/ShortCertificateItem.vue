<template>
  <div class="short-certificate-item">
    <checkbox-field v-model="isSelected" v-show="isShow" @click="clickItem" />
    <div class="short-certificate-item__body">
      <p>{{ name }}</p>
      <p>{{ date }}</p>

      <div class="short-certificate-item__btns">
        <app-button
          :text="$t('short-certificate-item.mint-btn-text')"
          @click="emit('open-modal', certificate)"
        />

        <app-button
          :text="$t('short-certificate-item.select-certificate-btn-text')"
          @click="clickItem"
        />

        <app-button
          class="short-certificate-item__btn-download"
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
.short-certificate-item {
  display: flex;
  justify-content: space-between;
  border: var(--border-primary-main), toRem(1), solid;
  border-radius: toRem(8);
  padding: toRem(16);
  align-items: center;
}

.short-certificate-item__body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRem(50);
  width: 100%;
  align-items: center;
}

.short-certificate-item__btn-download {
  font-size: toRem(20);
}

.short-certificate-item__btns {
  display: flex;
}
</style>
