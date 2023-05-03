<template>
  <modal>
    <div class="certificate-modal__img-wrp">
      <img :src="props.user.attributes.Img" alt="Certificate" />
    </div>
    <h1 class="certificate-modal__title">
      {{ $t('certificate-modal.title') }}
    </h1>
    <div class="certificate-modal__name">
      <label for="participant">
        {{ $t('certificate-modal.user-name') }}
      </label>
      <p id="participant">
        {{ props.user.attributes.Participant }}
      </p>
    </div>
    <p>{{ props.user.attributes.Date }}</p>
    <p>{{ props.user.attributes.CourseTitle }}</p>
    <input-field
      label="address"
      type="text"
      v-model="form.address"
      :error-message="getFieldErrorMessage('address')"
    />
    <div class="certificate-modal__btns">
      <app-button text="mint" @click="mint" />
      <app-button text="cancel" @click="emit('cancel', false)" />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { UserJSONResponse, IpfsJSONResponse } from '@/types'
import { InputField } from '@/fields'
import { reactive } from 'vue'
import { required, address } from '@/validators'

import { useErc721, useFormValidation } from '@/composables'

import { api } from '@/api'
import { config } from '@config'
import { Modal, AppButton } from '@/common'

const certificateSBT = useErc721(config.CONTRACT)
const form = reactive({
  address: '',
})

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  address: { required, address },
})

const props = withDefaults(
  defineProps<{
    user: UserJSONResponse
  }>(),
  {},
)

const mint = async () => {
  if (!isFormValid()) return
  const ipfsLink = await api.post<IpfsJSONResponse>(
    '/integrations/ccp/certificate/ipfs',
    {
      body: {
        data: {
          Description:
            props.user.attributes.Date +
            ' ' +
            props.user.attributes.Participant +
            ' ' +
            props.user.attributes.CourseTitle +
            ' ' +
            props.user.attributes.Points +
            ' ' +
            props.user.attributes.Note,
          Img: props.user.attributes.CertificateImg,
          Name: 'Certificate - ' + props.user.attributes.Participant,
        },
      },
    },
  )

  const url = ipfsLink.data.attributes.url

  await certificateSBT.safeMint(form.address, url)
}

const emit = defineEmits<{
  (e: 'cancel', state: boolean): boolean
}>()
</script>

<style scoped lang="scss">
.certificate-modal__img-wrp {
  display: flex;
  justify-content: center;
}

.certificate-modal__title {
  padding: toRem(30) 0;
  margin: auto;
}

.certificate-modal__btns {
  display: flex;
  justify-content: space-between;
}
</style>
