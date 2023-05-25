<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="auth-modal__pane">
        <input-field
          v-model="accessCodeInputValue"
          :label="$t('auth-modal.input-code-label')"
          :error-message="
            isInputValid ? '' : $t('validations.field-error_code')
          "
        />
        <app-button
          class="auth-modal__btn auth-modal__btn-link"
          color="info"
          size="medium"
          :text="$t('auth-modal.get-access-btn')"
          @click="window.open(props.tokenLink, '_blank')"
        />
        <div class="auth-modal__btns">
          <app-button
            class="auth-modal__btn auth-modal__btn-nav"
            color="info"
            :text="$t('auth-modal.send-codeInputValue-btn')"
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
import { ref } from 'vue'
import { Modal, AppButton } from '@/common'

const isInputValid = ref(false)
const accessCodeInputValue = ref('')

const props = defineProps<{
  isShown: boolean
  tokenLink: string
}>()

const emit = defineEmits<{
  (e: 'send-auth-code', code: string): boolean
  (event: 'update:is-shown', value: boolean): void
}>()

const sendCode = () => {
  if (!isInputValid.value) return
  emit('send-auth-code', accessCodeInputValue.value)
}
</script>

<style scoped lang="scss">
.auth-modal__pane {
  display: grid;
  width: toRem(400);
  height: toRem(400);
  background: var(--background-primary-main);
  border-radius: toRem(15);
  padding: toRem(24);
}

.auth-modal__btns {
  display: flex;
  height: toRem(58);
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
