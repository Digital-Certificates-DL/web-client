<template>
  <div class="home-page">
    <div class="home-page__body">
      <h2>{{ $t('home-page.title') }}</h2>
      <div class="home-page__body-nav">
        <navigation-block-item
          class="home-page__body-nav-item"
          :title="$t('home-page.upload-title')"
          :name="$t('home-page.upload-name')"
          :description="$t('home-page.upload-description')"
          @active="isUploadTemplateModalShown = true"
        />
        <navigation-block-item
          class="home-page__body-nav-item"
          :title="$t('home-page.create-title')"
          :name="$t('home-page.create-name')"
          :description="$t('home-page.create-description')"
          @active="router.push($routes.generate)"
        />
      </div>
      <div class="home-page__content">
        <div class="home-page__content-template">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home-page.template-list-title') }}</h3>
            <app-button
              color="info"
              :text="$t('home-page.get-all-btn-text')"
              :route="{
                name: $routes.templates,
              }"
            />
          </div>
          <div class="home-page__items">
            <preview-certificate-item
              v-for="(item, key) in slicedTemplatesList"
              :key="key"
              :img="item?.background_img"
              :title="item?.template_name"
            />
          </div>
        </div>
        <div class="home-page__content-certificates">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home-page.certificate-list-title') }}</h3>

            <app-button
              color="info"
              :text="$t('home-page.get-all-btn-text')"
              :route="{
                name: $routes.certificates,
              }"
            />
          </div>

          <div class="home-page__items">
            <preview-certificate-item
              v-for="(item, key) in slicedCertificatesList"
              :key="key"
              :img="item?.img"
              :title="item?.participant"
            />
          </div>
        </div>
      </div>
    </div>

    <loader-modal
      v-model:is-shown="isLoading"
      :text="$t('home-page.loader-text-getting-cert')"
    />
    <auth-modal
      v-model:is-shown="isUnauthorized"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />
    <upload-template-modal v-model:is-shown="isUploadTemplateModalShown" />
  </div>
</template>

<script lang="ts" setup>
import {
  PreviewCertificateItem,
  AppButton,
  LoaderModal,
  AuthModal,
  NavigationBlockItem,
  UploadTemplateModal,
} from '@/common'
import { router } from '@/router'
import { CertificateJSONResponse, TemplateJSONItem } from '@/types'
import { computed, ref } from 'vue'
import { useUserStore } from '@/store'
import { updateAuthCode, uploadCertificates, uploadTemplates } from '@/api'
import { ErrorHandler } from '@/helpers'
import { MAX_CERTIFICATES_ON_PAGE } from '@/constant'
import { ERROR_NAMES_ENUM } from '@/enums'

const userState = useUserStore()

const certificates = ref([] as CertificateJSONResponse[])
const isUnauthorized = ref(false)
const authLink = ref('')
const isLoading = ref(false)
const templates = ref<TemplateJSONItem[]>([])
const isUploadTemplateModalShown = ref(false)

const slicedCertificatesList = computed(() => {
  const result = new Array(MAX_CERTIFICATES_ON_PAGE)

  Object.entries(certificates.value.slice(0, MAX_CERTIFICATES_ON_PAGE)).forEach(
    ([key, value]) => {
      result[Number(key)] = value
    },
  )
  return result
})

const slicedTemplatesList = computed(() => {
  const result = new Array(MAX_CERTIFICATES_ON_PAGE)
  Object.entries(templates.value.slice(0, MAX_CERTIFICATES_ON_PAGE)).forEach(
    ([key, value]) => {
      result[Number(key)] = value
    },
  )
  return result
})

const getCertificates = async () => {
  try {
    certificates.value = await uploadCertificates(
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
  } catch (error) {
    if (error.meta && error.name === ERROR_NAMES_ENUM.forbiddenError) {
      authLink.value = error.meta.auth_link
      isUnauthorized.value = true
    }

    throw error
  }
}

const getTemplates = async () => {
  templates.value = await uploadTemplates(userState.userSetting.accountName)
}

const updateCode = async (code: string) => {
  await updateAuthCode(code, userState.userSetting.accountName)
  isUnauthorized.value = false
}

const init = async () => {
  isLoading.value = true
  try {
    await Promise.all([getTemplates(), getCertificates()])
  } catch (error) {
    ErrorHandler.process(error)
  }

  isLoading.value = false
}

init()
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  margin: 0 auto;
}

.home-page__body-nav {
  display: grid;
  gap: toRem(50);
  grid-template-columns: repeat(2, 1fr);
}

.home-page__body-nav-item {
  margin: toRem(20) 0;
  width: 100%;
}

.home-page__items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRem(150);
  max-height: toRem(222);
  min-height: toRem(200);
  height: 100%;
  width: 100%;
  margin-bottom: toRem(25);

  @include respond-to(xmedium) {
    gap: toRem(50);
  }
}

.home-page__item-mock {
  max-width: toRem(314);
  max-height: toRem(222);
  width: 100%;
  height: 100%;
  border-radius: toRem(8);
  background: var(--background-primary-dark);
}

.home-page__content-subtitle {
  display: flex;
  justify-content: space-between;
  margin: toRem(20) 0;
}
</style>
