<template>
  <modal
    :is-shown="props.isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="success-modal__pane">
      <div class="success-modal__payload">
        <icon class="success-modal__icon" :name="ICON_NAMES.certificate" />
        <div class="success-modal__info">
          <h3 class="success-modal__title">
            {{ $t('success-modal.title') }}
          </h3>
          <p class="success-modal__description">
            {{ $t('success-modal.description') }}
          </p>
        </div>
      </div>

      <app-button
        class="success-modal__btn"
        :text="$t('success-modal.btn')"
        color="success"
        @click="closeModal"
      />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Icon, AppButton } from '@/common'
import { ICON_NAMES } from '@/enums'
import modal from '@/common/Modal.vue'

const props = defineProps<{
  isShown: boolean
}>()

const emit = defineEmits<{
  (e: 'update:is-shown', v: boolean): void
  (e: 'success'): void
}>()

const closeModal = () => {
  emit('update:is-shown', false)
  emit('success')
}
</script>

<style lang="scss" scoped>
.success-modal__pane {
  background: var(--background-primary-main);
  padding: toRem(24);
  border-radius: toRem(8);
  width: toRem(652);
  height: toRem(256);
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

.success-modal__tx-wrp {
  margin-top: toRem(25);
}

.success-modal__tx {
  background: var(--background-primary-dark);
  padding: toRem(20);
}

.success-modal__btn {
  margin: toRem(15) auto;
}
</style>
