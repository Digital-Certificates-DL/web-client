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
          />

          <div class="generation-form__btns-wrp">
            <app-button
              class="generation-form__btn"
              color="info"
              size="large"
              :text="$t('generation-form.start-btn')"
              @click="start"
            />

            <app-button
              class="generation-form__btn"
              size="large"
              color="info"
              :route="{
                name: $routes.main,
              }"
              :text="$t('generation-form.cancel-btn')"
            />
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InputField } from '@/fields'
import { api } from '@/api'
import { AppButton } from '@/common'
import { Signature } from '@/utils'
import { CertificateJSONResponse, PottyCertificateRequest } from '@/types'
import { useUserStore } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { ErrorHandler, sleep } from '@/helpers'
import { useForm, useFormValidation } from '@/composables'
import { required } from '@/validators'
import { Container } from '@/types/container.types'
const userState = useUserStore()

const DEFAULT_KEY = '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW'

const { isFormDisabled, disableForm, enableForm } = useForm()

const emit = defineEmits<{
  (event: 'auth', code: string): void
}>()

const form = reactive({
  name: '',
  link: '',
})

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  name: { required },
  link: { required },
})

const start = async () => {
  if (!isFormValid) return
  try {
    disableForm()
    const users = await parsedData(form.link)
    if (!users) {
      return
    }
    const signatures = sign(users)
    await createPDF(signatures)
    await router.push({ name: ROUTE_NAMES.certificates })
  } catch (error) {
    ErrorHandler.process(error)
  } finally {
    enableForm()
  }
}
const parsedData = async (sheepUrl?: string) => {
  try {
    const { data } = await api.post<CertificateJSONResponse[]>(
      '/integrations/ccp/users/empty',
      {
        body: {
          data: {
            attributes: {
              name: userState.setting.accountName,
              url: sheepUrl || userState.setting.urlGoogleSheet,
            },
          },
        },
      },
    )
    return (data as CertificateJSONResponse[]) || undefined
  } catch (error) {
    if (error.metadata.link) {
      emit('auth', error.metadata.link)
      return
    }
    ErrorHandler.process(error)
  }
}

const prepareCertificate = (certificates: PottyCertificateRequest[]) => {
  const certificateList = ref<CertificateJSONResponse[]>([])
  for (const certificate of certificates) {
    certificateList.value.push(certificate.attributes)
  }
  return certificateList.value
}

const sign = (users: CertificateJSONResponse[]) => {
  const signature = new Signature(userState.setting.signKey)
  for (const user of users) {
    if (!user.signature || user.signature == '') {
      user.signature = signature.signMsg(user.msg)
    }
  }
  return users
}

const prepareCertificateImg = (users: CertificateJSONResponse[]) => {
  const list: CertificateJSONResponse[] = users
  for (const user of list) {
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
}

const validateContainerState = async (containerID: string) => {
  await sleep(5000)
  const containerStatus = true
  while (containerStatus) {
    try {
      const { data } = await api.get<Container>(
        '/integrations/ccp/certificate/' + containerID,
      )
      if (!data.status) {
        await sleep(5000)
        continue
      }

      data.clear_certificate = prepareCertificate(data.certificates)

      return data
    } catch (error) {
      await sleep(5000)
      // ErrorHandler.process(error)
    }
  }
}

const createPDF = async (users: CertificateJSONResponse[]) => {
  try {
    const { data } = await api.post<Container>(
      '/integrations/ccp/certificate/',
      {
        body: {
          data: {
            attributes: {
              users: users, //todo make better
              address: userState.setting.userBitcoinAddress || DEFAULT_KEY,
              url: userState.setting.urlGoogleSheet,
              name: userState.setting.accountName,
            },
          },
        },
      },
    )
    const container = await validateContainerState(data.container_id)
    const updatedUsers = prepareCertificateImg(container!.clear_certificate)
    userState.students = updatedUsers

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
  height: toRem(300);
}

.generation-form__field-number {
  width: toRem(30);
  height: toRem(30);
  color: var(--text-primary-invert-light);
  border-radius: toRem(20);
  background: var(--info-dark);
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
  width: toRem(450);
}

.generation-form__btn {
  width: toRem(200);
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
  display: flex;
}

.generation-form__choose-template {
  width: toRem(314);
  height: toRem(222);
  background: var(--background-primary-dark);
  border-radius: toRem(12);
  margin-right: toRem(15);
}

.generation-form__field-input {
  width: toRem(427);
}

.generation-form__field-images {
  display: flex;
}
</style>
