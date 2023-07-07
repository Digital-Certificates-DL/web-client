<template>
  <form class="mint-form">
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
        :text="$t('mint-form.mint-btn')"
        @click="mint"
      />
      <app-button
        class="mint-form__btn"
        color="info"
        :text="$t('mint-form.close-btn')"
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

import { api } from '@/api'
import { CertificateJSONResponse, IpfsAttributes } from '@/types'
import { ErrorHandler } from '@/helpers'
import { useErc721, useForm, useFormValidation } from '@/composables'
import { reactive, ref } from 'vue'

const { safeMint } = useErc721()
const tx = ref('')
const { isFormDisabled, disableForm, enableForm } = useForm()

const form = reactive({
  address: '',
})

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  address: { required, address },
})

const props = defineProps<{
  certificate: CertificateJSONResponse
}>()

const emit = defineEmits<{
  (event: 'mint-finished', tx: string): void
  (event: 'modal-close'): void
}>()

const mint = async () => {
  if (!isFormValid()) return

  try {
    disableForm()
    const { data } = await api.post<IpfsAttributes>(
      '/integrations/ccp/certificate/ipfs',
      {
        body: {
          data: {
            description: prepareTokenDescription(props.certificate),
            img: props.certificate.certificateImg,
            name: 'certificate - ' + props.certificate.participant,
          },
        },
      },
    )
    /* eslint-disable no-console */
    console.log(data)
    const mintTx = await safeMint(form.address, data.url)
    tx.value = mintTx!
  } catch (error) {
    ErrorHandler.process(error)
  } finally {
    enableForm()
    emit('mint-finished', tx.value)
  }
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
  width: toRem(200);
}

.mint-form__label {
  font-size: toRem(14);
  color: var(--text-secondary-light);
}

.mint-form__form-label {
  font-size: toRem(14);
  color: var(--text-primary-main);
}
</style>
