<template>
  <modal :is-shown="isShown">
    <div class="modal__window">
      <input-field
        label="Code"
        v-model="form.code"
        :error-message="getFieldErrorMessage('auth-code')"
      />
      <app-button
        class="modal__btn modal__btn-link"
        text="Give access"
        @click="window.open(props.tokenLink, '_blank')"
      />
      <div class="certificate-modal__btns">
        <app-button
          class="modal__btn modal__btn-nav"
          text="Send code"
          @click="sendCode"
        />
        <app-button
          class="modal__btn modal__btn-nav"
          text="Cancel"
          @click="emit('closeModal', false)"
        />
      </div>
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { InputField } from '@/fields'
import { reactive } from 'vue'
import AppButton from '@/common/AppButton.vue'
import { Modal } from '@/common'
import { useFormValidation } from '@/composables'
import { required } from '@/validators'

const form = reactive({
  code: '',
})

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  address: { required },
})

const props = withDefaults(
  defineProps<{
    isShown: boolean
    tokenLink: string
  }>(),
  {
    isShown: false,
    tokenLink: '',
  },
)

const emit = defineEmits<{
  (e: 'closeModal', state: boolean): boolean
  (e: 'withCode', code: string): boolean
}>()

const sendCode = () => {
  if (!isFormValid()) return
  emit('withCode', form.code)
}
</script>

<style scoped lang="scss">
.modal__window {
  width: 30%;
  height: 35%;
  background: white;
  border-radius: 1rem;
  flex-direction: row;
  padding: toRem(24);
  position: fixed;
  display: grid;
}

.certificate-modal__title {
  padding-top: toRem(30);
  padding-bottom: toRem(30);
  margin: auto;
}

.certificate-modal__btns {
  display: flex;
  justify-content: space-between;
}

.modal__btn {
  height: toRem(40);
}

.modal__btn-link {
  width: 100%;
}

.modal__btn-nav {
  width: 40%;
}
</style>
