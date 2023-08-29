<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="loader-modal__pane">
      <loader />
      <h2 class="loader-modal__text">
        {{ text }}
      </h2>
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, Loader } from '@/common'

defineProps<{
  text: string
  isShown: boolean
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.loader-modal__pane {
  display: grid;
  max-width: toRem(350);
  max-height: toRem(300);
  min-width: toRem(200);
  min-height: toRem(200);
  width: 100%;
  height: 100%;
  background: var(--background-primary-main);
  border-radius: toRem(15);
  padding: toRem(24);

  @include respond-to(small) {
    padding: 3%;
  }
}

.loader-modal__text {
  margin: auto;
  text-align: center;
}
</style>
