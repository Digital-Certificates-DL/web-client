<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="auth-modal__pane">
      <auth-form
        :token-link="tokenLink"
        @close-modal="closeModal"
        @send-auth-code="sendCode"
      />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { AuthForm } from '@/forms'
import { Modal } from '@/common'
import { useRouter } from '@/router'
import { ROUTE_NAMES } from '@/enums'

defineProps<{
  isShown: boolean
  tokenLink: string
}>()

const emit = defineEmits<{
  (event: 'send-auth-code', code: string): boolean
  (event: 'update:is-shown', value: boolean): void
}>()

const router = useRouter()

const sendCode = (code: string) => {
  emit('update:is-shown', false)
  emit('send-auth-code', code)
}

const closeModal = () => {
  emit('update:is-shown', false)
  router.push({ name: ROUTE_NAMES.settings })
}
</script>

<style scoped lang="scss">
.auth-modal__pane {
  display: grid;
  max-width: toRem(652);
  max-height: toRem(400);
  width: 100%;
  height: 100%;
  background: var(--background-primary-main);
  border-radius: toRem(15);
  padding: toRem(24);

  @include respond-to(small) {
    padding: 3%;
  }
}
</style>
