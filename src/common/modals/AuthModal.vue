<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="auth-modal">
        <input-field
          v-model="form.code"
          :label="$t('auth-code.input-code-label')"
          :error-message="getFieldErrorMessage('code')"
        />
        <app-button
          class="auth-modal__btn auth-modal__btn-link"
          :text="$t('auth-modal.get-access-btn')"
          :color="'info'"
          @click="window.open(props.tokenLink, '_blank')"
        />
        <div class="certificate-modal__btns">
          <app-button
            class="auth-modal__btn auth-modal__btn-nav"
            :text="$t('auth-modal.send-code-btn')"
            :color="'info'"
            @click="sendCode"
          />
          <app-button
            class="auth-modal__btn auth-modal__btn-nav"
            :text="$t('auth-modal.close-btn')"
            :color="'info'"
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
  (e: 'with-code', code: string): boolean
  (event: 'update:is-shown', value: boolean): void
}>()

const sendCode = () => {
  if (!isFormValid()) return
  emit('with-code', form.code)
}
</script>

<style scoped lang="scss">
.auth-modal {
  width: toRem(400);
  height: toRem(600);
  background: var(--white);
  border-radius: toRem(15);
  padding: toRem(24);
  display: grid;
}

.auth-modal__btn {
  width: toRem(200);
}

.auth-modal__btn-link {
  width: toRem(200);
}
</style>
