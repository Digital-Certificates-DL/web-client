<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="setting-modal__pane">
      <setting-form
        class="settings-modal__form"
        @error="onError"
        @close="onClose"
      />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { SettingForm } from '@/forms'
import { Modal } from '@/common'
import { ErrorHandler } from '@/helpers'

defineProps<{
  isShown: boolean
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', v: boolean): void
}>()

const onError = (msg: string) => {
  ErrorHandler.process(msg)
  emit('update:is-shown', false)
}

const onClose = () => {
  emit('update:is-shown', false)
}
</script>

<style lang="scss" scoped>
.setting-modal__pane {
  display: grid;
  background: var(--background-primary-main);
  padding: toRem(24);
  border-radius: toRem(8);
  max-width: toRem(600);
  width: 100%;

  @include respond-to(small) {
    padding: 3%;
  }
}

.settings-modal__form {
  margin: toRem(24);
}
</style>
