<template>
  <form class="mint-form" autocomplete="off">
    <input-field
      v-model="form.address"
      :label="$t('mint-form.placeholder-metamask-address')"
      :disabled="isFormDisabled"
      :error-message="getFieldErrorMessage('address')"
    />
    <div class="mint-form__btns">
      <app-button
        class="mint-form__btn"
        color="info"
        :text="$t('mint-form.mint-btn-text')"
        @click="mint"
      />
      <app-button
        class="mint-form__btn"
        color="info"
        :text="$t('mint-form.close-btn-text')"
        :disabled="isFormDisabled"
        @click="emit('modal-close')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { address, required } from '@/validators'
import { AppButton } from '@/common'
import { InputField } from '@/fields'
import { sendToIPFS } from '@/api'
import { CertificateJSONResponse } from '@/types'
import { ErrorHandler } from '@/helpers'
import { useErc721, useForm, useFormValidation } from '@/composables'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { errors } from '@/errors'

const props = defineProps<{
  certificate: CertificateJSONResponse
}>()

const emit = defineEmits<{
  (event: 'mint-finished', tx: string): void
  (event: 'modal-close'): void
  (event: 'error', msg: string): void
}>()

const { t } = useI18n()
const { safeMint } = useErc721()
const { isFormDisabled, disableForm, enableForm } = useForm()

const form = reactive({
  address: '',
})

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  address: { required, address },
})

const mint = async () => {
  if (!isFormValid()) return

  if (!props.certificate.certificateImg) {
    ErrorHandler.process(errors.EmptyImageError)
    return
  }

  try {
    disableForm()
    const data = await sendToIPFS(
      prepareTokenDescription(props.certificate),
      props.certificate.certificateImg,
      props.certificate.participant,
    )

    const mintTx = await safeMint(form.address, data.url)
    if (!mintTx) {
      emit('error', t('errors.failed-send-tx'))
      enableForm()
      return
    }
    emit('mint-finished', mintTx)
  } catch (error) {
    ErrorHandler.process(error)
  }
  enableForm()
}

const prepareTokenDescription = (certificate: CertificateJSONResponse) => {
  return (
    certificate.date +
    ' ' +
    certificate.participant +
    ' ' +
    certificate.courseTitle +
    ' ' +
    certificate.points +
    ' ' +
    certificate.note
  )
}
</script>

<style scoped lang="scss">
.mint-form__btns {
  display: flex;
  justify-content: space-between;
  margin-top: toRem(15);
}

.mint-form__btn {
  max-width: toRem(200);
  width: 100%;
}
</style>
