<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="container-error-modal__pane">
      <h3>
        {{ $t('container-error-modal.message') }}
      </h3>
      <app-button
        :text="$t('container-error-modal.btn-text')"
        class="container-error-modal__btn"
        @click="getContainerState"
      />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, AppButton } from '@/common'

const props = defineProps<{
  isShown: boolean
  containerId: string
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
  (event: 'try-again', containerId: string): void
}>()

const getContainerState = () => {
  emit('try-again', props.containerId)
  emit('update:is-shown', false)
}
</script>

<style scoped lang="scss">
.container-error-modal__pane {
  display: grid;
  max-width: toRem(400);
  max-height: toRem(200);
  width: 100%;
  height: 100%;
  background: var(--background-primary-main);
  border-radius: toRem(15);
  padding: toRem(24);

  @include respond-to(small) {
    padding: 3%;
  }
}

.container-error-modal__btn {
  margin: 0 auto;
}
</style>
