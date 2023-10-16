<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="upload-template-modal__pane">
        <div class="upload-template-modal__title">
          <h3>{{ $t('upload-template-modal.title') }}</h3>
        </div>
        <div class="upload-template-modal__form">
          <upload-template-form />
        </div>
        <app-button
          class="upload-template-modal__btn-close"
          color="info"
          size="large"
          :text="$t('upload-template-modal.close-btn-text')"
          @click="modal.close()"
        />
      </div>
    </template>
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
  max-height: toRem(400);
  width: 100%;
  height: 100%;
  background: var(--background-primary-light);
  border-radius: toRem(15);
  padding: toRem(24);
}

.upload-template-modal__btn-close {
  margin: toRem(20) auto;
  width: 100%;
}

.upload-template-modal__form {
  margin-top: toRem(40);
}
</style>
