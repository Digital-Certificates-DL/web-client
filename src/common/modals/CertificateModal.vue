<template>
  <modal
    :is-shown="props.isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="certificate-modal">
        <div class="certificate-modal__img-wrp">
          <img
            class="certificate-modal__img"
            :src="props.user.img || '/static/branding/template.jpg'"
            alt="Certificate"
          />
        </div>
        <h3 class="certificate-modal__title">
          {{ $t('certificate-modal.title') }}
        </h3>
        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-participant') }}
        </p>

        <h4>
          {{ props.user.participant }}
        </h4>

        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-date') }}
        </p>
        <h4>{{ props.user.date }}</h4>
        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-course') }}
        </p>

        <h4>{{ props.user.courseTitle }}</h4>
        <p class="certificate-modal__form-label">
          {{ $t('certificate-modal.label-metamask-address') }}
        </p>
        <input-field
          placeholder="address"
          v-model="form.address"
          :error-message="getFieldErrorMessage('address')"
        />
        <div class="certificate-modal__btns">
          <app-button
            class="certificate-modal__btn"
            :text="$t('certificate-modal.mint-btn')"
            :color="'info'"
            @click="mint"
          />
          <app-button
            class="certificate-modal__btn"
            :text="$t('certificate-modal.close-btn')"
            :color="'info'"
            @click="modal.close"
          />
        </div>
      </div>
    </template>
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

const props = defineProps<{
  isShown: boolean
  user: UserJSONResponse
}>()

const mint = async () => {
  if (!isFormValid()) return
  const ipfsLink = await api.post<IpfsJSONResponse>(
    '/integrations/ccp/certificate/ipfs',
    {
      body: {
        data: {
          Description:
            props.user.date +
            ' ' +
            props.user.participant +
            ' ' +
            props.user.courseTitle +
            ' ' +
            props.user.points +
            ' ' +
            props.user.note,
          Img: props.user.certificateImg,
          Name: 'certificate - ' + props.user.participant,
        },
      },
    },
  )

  const url = ipfsLink.data.attributes.url

  await certificateSBT.safeMint(form.address, url)
}

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.certificate-modal {
  width: toRem(475);
  height: toRem(796);
  background: var(--background-primary-main);
  border-radius: 1rem;
  flex-direction: row;
  padding: toRem(24);
  position: fixed;
  display: grid;
}

.certificate-modal__img-wrp {
  display: flex;
  justify-content: center;
}

.certificate-modal__img {
  width: toRem(427);
}

.certificate-modal__title {
  padding: toRem(10) 0;
  margin: auto;
}

.certificate-modal__btns {
  display: flex;
  justify-content: space-between;
}

.certificate-modal__btn {
  width: toRem(200);
}

.certificate-modal__label {
  font-size: toRem(14);
  color: var(--text-secondary-light);
}

.certificate-modal__form-label {
  font-size: toRem(14);
  color: var(--text-primary-main);
}
</style>
