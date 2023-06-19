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
            accessCodeInputValue.length > 0
              ? ''
              : $t('validations.field-error_code')
          "
        />

        <div class="auth-modal__btns">
          <app-button
            class="auth-modal__btn auth-modal__btn-nav"
            color="info"
            :text="$t('auth-modal.send-code-btn')"
            @click="sendCode"
          />
          <app-button
            class="auth-modal__btn auth-modal__btn-link"
            color="info"
            size="medium"
            :text="$t('auth-modal.get-access-btn')"
            @click="getAccess"
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
  emit('send-auth-code', accessCodeInputValue.value)
}

const getAccess = () => {
  window.open(props.tokenLink, '_blank')
}
</script>

<style scoped lang="scss">
.auth-modal__pane {
  display: grid;
  width: toRem(400);
  height: toRem(300);
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
  width: toRem(100);
}
</style>
