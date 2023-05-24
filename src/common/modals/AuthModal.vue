<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="auth-modal__pane">
        <input-field
          v-model="form.code"
          :label="$t('auth-modal.input-code-label')"
          :error-message="getFieldErrorMessage('code')"
        />
        <app-button
          class="auth-modal__btn auth-modal__btn-link"
          color="info"
          size="medium"
          :text="$t('auth-modal.get-access-btn')"
          @click="openLink"
        />
        <div class="auth-modal__btns">
          <app-button
            class="auth-modal__btn auth-modal__btn-nav"
            color="info"
            :text="$t('auth-modal.send-code-btn')"
            @click="sendCode"
          />
          <app-button
            class="auth-modal__btn auth-modal__btn-nav"
            color="info"
            :text="$t('auth-modal.close-btn')"
            @click="modal.close"
          />
        </div>
      </div>
    </template>
  </modal>
</template>

<script lang="ts" setup>
import { InputField } from '@/fields'
import { reactive } from 'vue'
import { Modal, AppButton } from '@/common'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'

const form = reactive({
  code: '',
})

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  code: { required },
})

const props = defineProps<{
  isShown: boolean
  tokenLink: string
}>()

const emit = defineEmits<{
  (e: 'send-auth-code', code: string): boolean
  (event: 'update:is-shown', value: boolean): void
}>()

const openLink = () => {
  window.open(props.tokenLink, '_blank')
}
const sendCode = () => {
  if (!isFormValid()) return
  emit('send-auth-code', form.code)
}
</script>

<style scoped lang="scss">
.auth-modal__pane {
  width: toRem(400);
  height: toRem(400);
  background: var(--background-primary-main);
  border-radius: toRem(15);
  padding: toRem(24);
  display: grid;
}

.auth-modal__btns {
  height: toRem(58);
  display: flex;
  justify-content: space-between;
}

.auth-modal__btn {
  max-width: toRem(100);
}

.auth-modal__btn-link {
  width: 100%;
  max-height: toRem(58);
  margin: 0 auto;
}
</style>
