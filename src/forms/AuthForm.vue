<template>
  <form class="auth-form">
    <input-field
      v-model="accessCodeInputData"
      class="auth-modal-form__input"
      :label="$t('auth-modal-form.input-code-label')"
      :error-message="isInputValid ? '' : $t('validations.field-error_code')"
      @input="validateCode"
    />

    <div class="auth-form__btns">
      <app-button
        class="auth-modal-form__btn"
        color="info"
        :text="$t('auth-modal-form.get-access-btn')"
        @click="window.open(props.tokenLink, '_blank')"
      />
      <app-button
        class="auth-modal-form__btn"
        color="info"
        :text="$t('auth-modal-form.send-code-btn')"
        @click="sendCode"
      />
      <app-button
        class="auth-modal-form__btn"
        color="info"
        :text="$t('auth-modal-form.close-btn')"
        @click="emit('close-modal')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { InputField } from '@/fields'
import { ref } from 'vue'
import { AppButton } from '@/common'

const isInputValid = ref(false)
const accessCodeInputData = ref('')

const props = defineProps<{
  tokenLink: string
}>()

const emit = defineEmits<{
  (e: 'send-auth-code', code: string): boolean
  (e: 'close-modal'): boolean
}>()

const sendCode = () => {
  if (!isInputValid.value) return
  emit('send-auth-code', accessCodeInputData.value)
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

.auth-form__btns {
  display: flex;
  height: toRem(58);
  justify-content: space-between;
}

.auth-modal-form__btn {
  width: toRem(100);
}

.auth-modal-form__btn-link {
  max-height: toRem(58);
  width: toRem(200);
  margin: 0 auto;
}

.auth-modal-form__input {
  margin: 0 auto;
  width: toRem(350);
}
</style>
