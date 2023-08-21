<template>
  <form class="generation-form" autocomplete="off">
    <div class="generation-form__body">
      <div class="generation-form__state-labels">
        <div class="generation-form__field-short">
          <p class="generation-form__field-number">
            {{ $t('generation-form.step-1-number') }}
          </p>
          <div class="generation-form__field-border"></div>
        </div>
        <div class="generation-form__field">
          <p class="generation-form__field-number">
            {{ $t('generation-form.step-2-number') }}
          </p>
          <div class="generation-form__field-border"></div>
        </div>
        <div class="generation-form__field">
          <p class="generation-form__field-number">
            {{ $t('generation-form.step-3-number') }}
          </p>
        </div>
      </div>

      <div class="generation-form__payload">
        <div class="generation-form__field-short">
          <div class="generation-form__field-info">
            <p class="generation-form__field-title">
              {{ $t('generation-form.step-1-title') }}
            </p>
          </div>
          <div>
            <p class="generation-form__field-description">
              {{ $t('generation-form.step-1-description') }}
            </p>

            <input-field
              v-model="form.name"
              class="generation-form__text-input"
              :label="$t('generation-form.step-1-placeholder')"
              :disabled="isFormDisabled"
              :error-message="getFieldErrorMessage('name')"
            />
          </div>
        </div>

        <div class="generation-form__field">
          <div class="generation-form__field-info">
            <p class="generation-form__field-title">
              {{ $t('generation-form.step-2-title') }}
            </p>
          </div>
          <p class="generation-form__field-description">
            {{ $t('generation-form.step-2-description') }}
          </p>
          <div class="generation-form__choose-template-list">
            <div class="generation-form__choose-template"></div>
            <div class="generation-form__choose-template"></div>
            <div class="generation-form__choose-template"></div>
          </div>
        </div>

        <div class="generation-form__field">
          <div class="generation-form__field-info">
            <p class="generation-form__field-title">
              {{ $t('generation-form.step-3-title') }}
            </p>
          </div>
          <p class="generation-form__field-description">
            {{ $t('generation-form.step-3-description') }}
          </p>

          <input-field
            v-model="form.link"
            class="generation-form__text-input"
            :label="$t('generation-form.step-3-placeholder')"
            :disabled="isFormDisabled"
            :error-message="getFieldErrorMessage('link')"
          />

          <div class="generation-form__btns-wrp">
            <app-button
              class="generation-form__btn"
              color="info"
              size="large"
              :text="$t('generation-form.start-btn-text')"
              :disabled="!isFormValid"
              @click="start"
            />

            <app-button
              class="generation-form__btn"
              size="large"
              color="info"
              :route="{
                name: $routes.main,
              }"
              :text="$t('generation-form.cancel-btn-text')"
            />
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { InputField } from '@/fields'
import { createPdfAPICall, uploadCertificatesAPICall } from '@/api/api'
import { AppButton } from '@/common'
import { CertificateJSONResponse } from '@/types'
import { useUserStore } from '@/store'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import {
  ErrorHandler,
  prepareCertificateImage,
  signCertificateData,
  validateContainerState,
} from '@/helpers'
import { useForm, useFormValidation } from '@/composables'
import { link, maxLength, required } from '@/validators'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userState = useUserStore()
const { isFormDisabled, disableForm, enableForm } = useForm()

const MAX_NAME_LENGTH = 100

defineProps<{
  isLoaderShown: boolean
}>()

const emit = defineEmits<{
  (event: 'auth', code: string): void
  (event: 'update:is-loader-shown', isShown: boolean): void
  (event: 'update-loader-state', state: string): void
}>()

const form = reactive({
  name: '',
  link: '',
})

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  name: { required, maxLength: maxLength(MAX_NAME_LENGTH) },
  link: { required, link },
})

const start = async () => {
  if (!isFormValid) return
  try {
    disableForm()
    emit('update:is-loader-shown', true)
    emit('update-loader-state', t('generation-form.process-state-update-data'))
    const certificates = await parseData(form.link)
    if (!certificates) {
      return
    }
    emit('update-loader-state', t('generation-form.process-state-sign-data'))

    const signatures = await signCertificateData(
      certificates,
      userState.userSetting.signKey,
    )
    emit('update-loader-state', t('generation-form.process-state-create-pdf'))
    await createPDF(signatures)

    emit('update:is-loader-shown', false)
    await router.push({ name: ROUTE_NAMES.certificates })
  } catch (error) {
    emit('update:is-loader-shown', false)
    ErrorHandler.process(error)
  }

  enableForm()
}

const parseData = async (sheepUrl?: string) => {
  try {
    return await uploadCertificatesAPICall(
      userState.userSetting.accountName,
      sheepUrl || userState.userSetting.urlGoogleSheet,
    )
  } catch (error) {
    if (error.metadata.link) {
      emit('auth', error.metadata.link)
      return
    }

    throw error
  }
}

const createPDF = async (users: CertificateJSONResponse[]) => {
  try {
    const data = await createPdfAPICall(
      users,
      userState.userSetting.userBitcoinAddress,
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
    const container = await validateContainerState(data.container_id)
    if (!container) {
      ErrorHandler.process(t('errors.empty-container'))
      return
    }
    const updatedUsers = prepareCertificateImage(container.clear_certificate)
    userState.setCertificates(updatedUsers)

    return updatedUsers
  } catch (error) {
    ErrorHandler.process(error)
  }
}
</script>

<style scoped lang="scss">
.generation-form__body {
  display: flex;
}

.generation-form__title {
  margin-bottom: toRem(30);
}

.generation-form__payload {
  margin-left: toRem(20);
  width: 100%;
}

.generation-form__field-short {
  display: flow;
  text-align: center;
  row-gap: toRem(8);
  height: toRem(150);
  margin-bottom: toRem(20);
}

.generation-form__field {
  display: flow;
  text-align: center;
  row-gap: toRem(8);
  max-height: toRem(300);
  height: 100%;
}

.generation-form__field-number {
  width: toRem(30);
  height: toRem(30);
  color: var(--text-primary-invert-light);
  border-radius: toRem(20);
  background: var(--info-dark);
}

.generation-form__input-wrp {
  max-width: toRem(450);
}

.generation-form__field-border {
  width: toRem(1);
  height: 65%;
  margin: toRem(30) auto;
  border: toRem(1) solid var(--info-dark);
}

.generation-form__field-payload {
  margin: toRem(10) 0;
}

.generation-form__field-title {
  display: flex;
  text-align: left;
}

.generation-form__field-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: toRem(20);
}

.generation-form__field-border-wrp {
  display: grid;
  justify-items: center;
}

.generation-form__btns-wrp {
  display: flex;
  margin-top: toRem(50);
}

.generation-form__text-input {
  max-width: toRem(450);
  width: 100%;
}

.generation-form__btn {
  max-width: toRem(200);
  width: 100%;
  border-radius: toRem(8);
  margin-right: toRem(10);
}

.generation-form__field-description {
  text-align: left;
  max-width: 30%;
  font-size: toRem(14);
  color: var(--text-primary-light);
  margin-bottom: toRem(10);
  line-height: 1.5;
}

.generation-form__choose-template-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRem(50);
  max-height: toRem(180);
  height: 100%;
}

.generation-form__choose-template {
  max-width: toRem(314);
  width: 100%;
  background: var(--background-primary-dark);
  border-radius: toRem(12);
  margin-right: toRem(15);
  height: 100%;
}

.generation-form__field-input {
  max-width: toRem(427);
  width: 100%;
}

.generation-form__field-images {
  display: flex;
}
</style>
