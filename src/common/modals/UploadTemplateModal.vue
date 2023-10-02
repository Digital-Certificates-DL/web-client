<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="upload-template-modal__pane">
      <div class="upload-template-modal__title">
        <p>{{ $t('upload-template-modal.title') }}</p>
      </div>
      <div class="upload-template-modal__description">
        <p>{{ $t('upload-template-modal.description') }}</p>
      </div>
      <div class="upload-template-modal__form">
        <upload-template-form />
      </div>
      <app-button
        class="upload-template-modal__btn-close"
        color="info"
        size="large"
        :text="$t('upload-template-modal.close-btn-text')"
        @click="emit('update:is-shown', false)"
      />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, AppButton } from '@/common'
import { UploadTemplateForm } from '@/forms'

defineProps<{
  isShown: boolean
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.upload-template-modal__pane {
  max-width: toRem(600);
  max-height: toRem(500);
  width: 100%;
  height: 100%;
  background: var(--background-primary-light);
  border-radius: toRem(15);
  padding: toRem(24);
  top: 0;
}

.upload-template-modal__btn-close {
  margin: toRem(20) auto;
  width: 100%;
}
</style>
