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
            <div v-for="(item, key) in computedTemplates" :key="key">
              <preview-certificate-item
                v-if="item"
                :img="item.background_img"
                :title="item.template_name"
              />
              <preview-certificate-item
                v-else
                img="/branding/mock.jpg"
                title=""
              />
            </div>
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
            <div v-for="(item, key) in computedCertificates" :key="key">
              <preview-certificate-item
                v-if="item"
                :img="item.img"
                :title="item.participant"
              />

              <preview-certificate-item
                v-else
                img="/branding/mock.jpg"
                title=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <loader-modal v-model:is-shown="isLoading" v-model:text="loaderText" />
    <auth-modal
      v-model:is-shown="isUnauthorized"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />
    <upload-template-modal v-model:is-shown="isUploadTemplateModalShown" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
const userState = useUserStore()

const certificates = ref([] as CertificateJSONResponse[])
const isUnauthorized = ref(false)
const authLink = ref('')
const isLoading = ref(false)
const loaderText = ref('')
const templates = ref([] as TemplateJSONItem[])
const isUploadTemplateModalShown = ref(false)

const computedCertificates = computed(() => {
  const result = new Array(MAX_CERTIFICATES_ON_PAGE)

  Object.entries(certificates.value.slice(0, MAX_CERTIFICATES_ON_PAGE)).forEach(
    ([key, value]) => {
      result[Number(key)] = value
    },
  )
  return result
})

const computedTemplates = computed(() => {
  const result = new Array(MAX_CERTIFICATES_ON_PAGE)
  Object.entries(templates.value.slice(0, MAX_CERTIFICATES_ON_PAGE)).forEach(
    ([key, value]) => {
      result[Number(key)] = value
    },
  )
  return result
})

const getCertificates = async () => {
  isLoading.value = true
  loaderText.value = t('home-page.loader-text-getting-cert')

  try {
    certificates.value = await uploadCertificates(
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
    /* eslint-disable no-console */
    console.log(certificates.value)
  } catch (error) {
    if (error.meta && error.name === 'ForbiddenError') {
      authLink.value = error.meta.auth_link
      isUnauthorized.value = true
      return
    }

    ErrorHandler.process(error)
    // router.push({ name: ROUTE_NAMES.main })
  } finally {
    isLoading.value = false
  }
}
const getTemplates = async () => {
  try {
    templates.value = await uploadTemplates(userState.userSetting.accountName)
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const updateCode = async (code: string) => {
  await updateAuthCode(code, userState.userSetting.accountName)
  isUnauthorized.value = false
}

getCertificates()
getTemplates()
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
