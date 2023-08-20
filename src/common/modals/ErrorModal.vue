<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="error-modal__pane">
      <div class="error-modal__payload">
        <icon class="error-modal__icon" :name="$icons.certificateError" />
        <div class="error-modal__info">
          <h3 class="error-modal__title">
            {{ $t('error-modal.title') }}
          </h3>
          <p class="error-modal__description">
            {{ message || $t('errors.default') }}
          </p>
        </div>
      </div>
      <app-button
        class="error-modal__btn"
        size="large"
        color="error"
        :text="$t('error-modal.btn-text')"
        @click="tryAgain"
      />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, Icon, AppButton } from '@/common'

defineProps<{
  message: string
  isShown: boolean
}>()

const emit = defineEmits<{
  (e: 'update:is-shown', v: boolean): void
}>()

const tryAgain = () => {
  emit('update:is-shown', false)
}
</script>

<style lang="scss" scoped>
.error-modal__pane {
  display: grid;
  background: var(--background-primary-main);
  padding: toRem(24);
  border-radius: toRem(8);
  max-width: toRem(652);
  width: 100%;
  height: 100%;
  max-height: toRem(200);
  min-width: toRem(200);
  min-height: toRem(104);

  @include respond-to(small) {
    padding: 3%;
  }
}

.error-modal__payload {
  display: flex;
}

.error-modal__description {
  color: var(--text-secondary-light);
}

.error-modal__icon {
  width: toRem(55);
  height: toRem(55);
  margin-right: toRem(20);
}

.error-modal__btn {
  margin: toRem(10) auto;
}
</style>
