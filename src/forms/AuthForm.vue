<template>
  <form class="auth-form" autocomplete="off">
    <h3 class="auth-form__title">
      {{ $t('auth-form.title') }}
    </h3>
    <div>
      <p class="auth-form__step-title">
        {{ $t('auth-form.step-1-title') }}
      </p>

      <a
        class="auth-form__link"
        target="_blank"
        rel="noopener noreferrer"
        :href="tokenLink"
      >
        {{ $t('auth-form.step-1-description') }}
      </a>
    </div>

    <p class="auth-form__step-title">
      {{ $t('auth-form.step-2-title') }}
    </p>

    <input-field
      v-model="form.accessCode"
      class="auth-form__input"
      :label="$t('auth-form.input-code-label')"
      :disabled="isFormDisabled"
      :error-message="getFieldErrorMessage('accessCode')"
    />

    <div class="auth-form__btns">
      <app-button
        class="auth-form__btn"
        color="info"
        size="large"
        :text="$t('auth-form.send-code-btn-text')"
        @click="sendCode"
      />
      <app-button
        class="auth-form__btn"
        color="info"
        size="large"
        :text="$t('auth-form.close-btn-text')"
        @click="emit('close-modal')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { InputField } from '@/fields'
import { reactive } from 'vue'
import { AppButton } from '@/common'
import { useForm, useFormValidation } from '@/composables'
import { required } from '@/validators'

const { isFormDisabled, disableForm, enableForm } = useForm()

defineProps<{
  tokenLink: string
}>()

const emit = defineEmits<{
  (event: 'send-auth-code', code: string): boolean
  (event: 'close-modal'): boolean
}>()

const form = reactive({
  accessCode: '',
})

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  accessCode: { required },
})

const sendCode = () => {
  if (!isFormValid) return
  disableForm()

  emit('send-auth-code', form.accessCode)
  enableForm()
}
</script>

<style scoped lang="scss">
.auth-form {
  display: grid;
}

.auth-form__title {
  margin-bottom: toRem(20);
}

.auth-form__btns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRem(100);
  height: toRem(58);
}

.auth-form__input {
  margin: 0 auto;
}

.auth-form__step-title {
  font-size: toRem(21);
  font-weight: 700;
}

.auth-form__btn {
  max-width: toRem(300);
  width: 100%;
}

.auth-form__link {
  color: var(--text-primary-light);
}
</style>
