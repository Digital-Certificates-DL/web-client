<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="auth-modal__pane">
        <auth-modal-form
          class="auth-modal__form"
          :token-link="tokenLink"
          @close-modal="modal.close()"
          @send-auth-code="sendCode"
        />
      </div>
    </template>
  </modal>
</template>

<script lang="ts" setup>
import { AuthModalForm } from '@/forms'
import { Modal } from '@/common'

defineProps<{
  isShown: boolean
  tokenLink: string
}>()

const emit = defineEmits<{
  (e: 'send-auth-code', code: string): boolean
  (event: 'update:is-shown', value: boolean): void
}>()

const sendCode = (code: string) => {
  emit('send-auth-code', code)
}
</script>

<style scoped lang="scss">
.auth-modal__pane {
  display: grid;
  width: toRem(400);
  height: toRem(250);
  background: var(--background-primary-main);
  border-radius: toRem(15);
  padding: toRem(24);
}
</style>
