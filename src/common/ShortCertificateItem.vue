<template>
  <div class="short-certificate-item">
    <checkbox-field v-model="isSelected" v-show="isShown" />
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
import { ref, watch } from 'vue'
import { AppButton } from '@/common'

const props = defineProps<{
  isShown: boolean
  name: string
  date: string
  certificate: CertificateJSONResponse
}>()

const emit = defineEmits<{
  (event: 'open-modal', certificate: CertificateJSONResponse): boolean
  (
    event: 'select',
    isSelected: boolean,
    certificate: CertificateJSONResponse,
  ): boolean
}>()

const isSelected = ref(false)

const openLink = (certificate: CertificateJSONResponse) => {
  window.open('https://' + certificate.certificate, 'download')
}

const clickItem = () => {
  isSelected.value = !isSelected.value
}

watch(isSelected, () => {
  emit('select', isSelected.value, props.certificate)
})
</script>

<style scoped lang="scss">
.short-certificate-item {
  display: flex;
  align-items: center;
  width: 100%;
  border: var(--border-primary-main), toRem(1), solid;
  border-radius: toRem(8);
  padding: toRem(16);
}

.short-certificate-item__body {
  display: grid;
  grid-template-columns: 3fr 1fr 2fr;
  gap: toRem(15);
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
