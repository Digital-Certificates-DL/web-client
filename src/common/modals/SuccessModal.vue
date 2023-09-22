<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="success-modal__pane">
        <div class="success-modal__payload">
          <icon class="success-modal__icon" :name="$icons.certificate" />
          <div>
            <h3>
              {{ $t('success-modal.title') }}
            </h3>
            <p class="success-modal__description">
              {{ $t('success-modal.description') }}
            </p>
          </div>
        </div>

        <p class="success-modal__tx">
          {{ transaction }}
        </p>
        <app-button
          class="success-modal__btn"
          color="success"
          :text="$t('success-modal.close-btn-text')"
          @click="modal.close"
        />
      </div>
    </template>
  </modal>
</template>

<script lang="ts" setup>
import { Icon, AppButton, Modal } from '@/common'

defineProps<{
  isShown: boolean
  transaction: string
}>()

const emit = defineEmits<{
  (e: 'update:is-shown', v: boolean): void
}>()
</script>

<style lang="scss" scoped>
.success-modal__pane {
  display: grid;
  background: var(--background-primary-main);
  padding: toRem(24);
  border-radius: toRem(8);
  max-width: toRem(720);
  max-height: toRem(256);
  width: 100%;
  height: 100%;

  @include respond-to(small) {
    padding: 3%;
  }
}

.success-modal__payload {
  display: flex;
}

.success-modal__description {
  color: var(--text-secondary-light);
}

.success-modal__icon {
  width: toRem(55);
  height: toRem(55);
  margin-right: toRem(20);
}

.success-modal__tx {
  background: var(--background-primary-dark);
  padding: toRem(20);
}

.success-modal__btn {
  margin: toRem(15) auto;
}
</style>
