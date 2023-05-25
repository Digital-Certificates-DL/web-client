<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="certificate-modal__pane">
        <div class="certificate-modal__img-wrp">
          <img
            class="certificate-modal__img"
            :src="user.img || '/branding/template.jpg'"
            :alt="$t('certificate-modal.certificate-alt')"
          />
        </div>
        <h3 class="certificate-modal__title">
          {{ $t('certificate-modal.title') }}
        </h3>
        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-participant') }}
        </p>

        <h4>
          {{ user.participant }}
        </h4>

        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-date') }}
        </p>
        <h4>{{ user.date }}</h4>
        <p class="certificate-modal__label">
          {{ $t('certificate-modal.label-course') }}
        </p>

        <h4>{{ user.courseTitle }}</h4>
        <p class="certificate-modal__form-label">
          {{ $t('certificate-modal.label-metamask-address') }}
        </p>
        <input-field
          v-model="inputAddressValue"
          :label="$t('certificate-modal.label-metamask-address')"
          :error-message="
            validateAddress ? '' : $t('validations.field-error_address')
          "
          :disabled="isFieldDisable"
        />
        <div class="certificate-modal__btns">
          <app-button
            class="certificate-modal__btn"
            color="info"
            :text="$t('certificate-modal.mint-btn')"
            @click="mint"
          />
          <app-button
            class="certificate-modal__btn"
            color="info"
            :text="$t('certificate-modal.close-btn')"
            :disabled="isFieldDisable"
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
import { ref } from 'vue'
import { useErc721 } from '@/composables'
import { api } from '@/api'
import { Modal, AppButton } from '@/common'
import { ErrorHandler } from '@/helpers'

const { safeMint } = useErc721()
const isFieldDisable = ref(false)
const inputAddressValue = ref('')
const isInputAddressValid = ref('')

const props = defineProps<{
  isShown: boolean
  user: UserJSONResponse
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()

const validateAddress = () => {
  return /^(0x){1}[0-9a-fA-F]{40}$/i.test(inputAddressValue.value)
}

const mint = async () => {
  if (!isInputAddressValid.value) return

  try {
    isFieldDisable.value = true
    const ipfsLink = await api.post<IpfsJSONResponse>(
      '/integrations/ccp/certificate/ipfs',
      {
        body: {
          data: {
            description: prepareTokenDescription(props.user),
            img: props.user.certificateImg,
            name: 'certificate - ' + props.user.participant,
          },
        },
      },
    )

    await safeMint(inputAddressValue.value, ipfsLink.data.attributes.url)
    isFieldDisable.value = false
  } catch (error) {
    isFieldDisable.value = false

    ErrorHandler.process(error)
  }
}

const prepareTokenDescription = (user: UserJSONResponse) => {
  return (
    user.date +
    ' ' +
    user.participant +
    ' ' +
    user.courseTitle +
    ' ' +
    user.points +
    ' ' +
    user.note
  )
}
</script>

<style scoped lang="scss">
.certificate-modal__pane {
  display: grid;
  position: fixed;
  width: toRem(475);
  height: toRem(796);
  background: var(--background-primary-main);
  border-radius: toRem(16);
  padding: toRem(24);
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
