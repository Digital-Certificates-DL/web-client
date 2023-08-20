<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="certificate-modal__pane">
        <div class="certificate-modal__img-wrp">
          <img
            class="certificate-modal__img"
            :src="certificate.img || '/branding/template.jpg'"
            :alt="$t('certificate-modal.certificate-alt')"
          />
        </div>
        <h3 class="certificate-modal__title">
          {{ $t('certificate-modal.title') }}
        </h3>
        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-participant') }}
        </p>

        <h4>
          {{ certificate.participant }}
        </h4>

        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-date') }}
        </p>
        <h4>{{ certificate.date }}</h4>
        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-course') }}
        </p>

        <h4>{{ certificate.courseTitle }}</h4>
        <p class="certificate-modal__form-label">
          {{ $t('certificate-modal.label-metamask-address') }}
        </p>

        <mint-form
          :certificate="certificate"
          @mint-finished="onSuccess"
          @modal-close="modal.close"
        />
      </div>
    </template>
  </modal>
</template>

<script lang="ts" setup>
import { CertificateJSONResponse } from '@/types'

import { Modal } from '@/common'
import { MintForm } from '@/forms'

defineProps<{
  isShown: boolean
  certificate: CertificateJSONResponse
}>()

const emit = defineEmits<{
  (e: 'success', tx: string): boolean
}>()

const onSuccess = (tx: string) => {
  emit('success', tx)
}
</script>

<style scoped lang="scss">
.certificate-modal__pane {
  display: grid;
  position: fixed;
  max-width: toRem(475);
  max-height: toRem(796);
  width: 100%;
  height: 100%;
  background: var(--background-primary-main);
  border-radius: toRem(16);
  padding: toRem(24);

  @include respond-to(x-small) {
    padding: 3%;
  }
}

.certificate-modal__img-wrp {
  display: flex;
  justify-content: center;
}

.certificate-modal__img {
  max-width: toRem(427);
  width: 100%;
}

.certificate-modal__title {
  padding: toRem(10) 0;
  margin: auto;
}
</style>
