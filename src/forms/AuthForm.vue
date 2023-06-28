<template>
  <form class="auth-form">
    <h3 class="auth-form__title">
      {{ $t('auth-modal.title') }}
    </h3>
    <div>
      <p class="auth-form__step-title">
        {{ $t('auth-modal.step-1-title') }}
      </p>

      <a
        class="auth-form__link"
        :href="tokenLink"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ $t('auth-modal.step-1-description') }}
      </a>
    </div>

    <p class="auth-form__step-title">
      {{ $t('auth-modal.step-2-title') }}
    </p>

    <input-field
      v-model="form.accessCodeInputData"
      class="auth-modal-form__input"
      :label="$t('auth-modal-form.input-code-label')"
      :disabled="isFormDisabled"
      :error-message="getFieldErrorMessage('code')"
      @input="validateCode"
    />

    <div class="auth-form__btns">
      <app-button
        class="auth-modal-form__btn"
        color="info"
        size="large"
        :text="$t('auth-modal-form.send-code-btn')"
        @click="sendCode"
      />
      <app-button
        class="auth-modal-form__btn"
        color="info"
        size="large"
        :text="$t('auth-modal-form.close-btn')"
        @click="emit('close-modal')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { InputField } from '@/fields'
import { reactive, ref } from 'vue'
import { AppButton } from '@/common'
import { useForm, useFormValidation } from '@/composables'
import { required } from '@/validators'

const { isFormDisabled, disableForm, enableForm } = useForm()

const isInputValid = ref(false)
const accessCodeInputData = ref('')

defineProps<{
  tokenLink: string
}>()

const emit = defineEmits<{
  (e: 'send-auth-code', code: string): boolean
  (e: 'close-modal'): boolean
}>()

const form = reactive({
  accessCodeInputData: '',
})

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  accessCodeInputData: { required },
})

const sendCode = () => {
  if (!isFormValid) return
  disableForm()

  emit('send-auth-code', accessCodeInputData.value)

  enableForm()
}

const validateCode = () => {
  if (accessCodeInputData.value != '') {
    isInputValid.value = true
  }
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
  display: flex;
  height: toRem(58);
  justify-content: space-between;
}

.auth-modal-form__input {
  margin: 0 auto;
}

.auth-form__step-title {
  font-size: toRem(21);
  font-weight: 700;
}

.auth-modal-form__btn {
  width: 45%;
}

.auth-form__link {
  color: var(--text-primary-light);
}
</style>
