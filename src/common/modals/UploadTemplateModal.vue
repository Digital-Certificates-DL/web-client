<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="upload-template-modal__pane"></div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal } from '@/common'

defineProps<{
  isShown: boolean
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.upload-template-modal__pane {
  display: grid;
  max-width: toRem(400);
  max-height: toRem(600);
  min-width: toRem(200);
  min-height: toRem(300);
  width: 100%;
  height: 100%;
  background: var(--background-primary-main);
  border-radius: toRem(15);
  padding: toRem(24);

  @include respond-to(small) {
    padding: 3%;
  }
}

.loader-modal__title {
  margin: auto;
}
</style>
