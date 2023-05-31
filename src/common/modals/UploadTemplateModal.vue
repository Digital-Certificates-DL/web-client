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

const props = defineProps<{
  isShown: boolean
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.upload-template-modal__pane {
  width: toRem(400);
  height: toRem(600);
  background: var(--white);
  border-radius: toRem(15);
  padding: toRem(24);
  display: grid;
}

.loader-modal__title {
  margin: auto;
}
</style>
