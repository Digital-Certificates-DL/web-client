<template>
  <form class="mint-form" action="">
    <input-field
      v-model="inputAddressValue"
      :label="$t('mint-form.placeholder-metamask-address')"
      :error-message="
        validateAddress(inputAddressValue)
          ? ''
          : $t('validations.field-error_address')
      "
      :disabled="isFieldDisable"
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
        :disabled="isFieldDisable"
        @click="emit('mint-finished')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { validateAddress } from '@/validators'
import { AppButton } from '@/common'
import { InputField } from '@/fields'

import { api } from '@/api'
import { IpfsJSONResponse, CertificateJSONResponse } from '@/types'
import { ErrorHandler } from '@/helpers'
import { ref } from 'vue'
import { useErc721 } from '@/composables'

const { safeMint } = useErc721()
const isFieldDisable = ref(false)
const inputAddressValue = ref('')
const isInputAddressValid = ref('')

const props = defineProps<{
  certificate: CertificateJSONResponse
}>()

const emit = defineEmits<{
  (event: 'mint-finished'): void
}>()

const mint = async () => {
  if (!isInputAddressValid.value) return

  try {
    isFieldDisable.value = true
    const ipfsLink = await api.post<IpfsJSONResponse>(
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

    await safeMint(inputAddressValue.value, ipfsLink.data.attributes.url)
    isFieldDisable.value = false
  } catch (error) {
    isFieldDisable.value = false

    ErrorHandler.process(error)
  } finally {
    emit('mint-finished')
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
