<template>
  <div class="home-page">
    <div class="home-page__body">
      <h2>{{ $t('home-page.title') }}</h2>
      <div class="home-page__body-nav">
        <home-navigation
          class="home-page__body-nav-item"
          :title="$t('home-page.upload-title')"
          :name="$t('home-page.upload-name')"
          :description="$t('home-page.upload-description')"
          @active="router.push($routes.template)"
        />
        <home-navigation
          class="home-page__body-nav-item"
          :title="$t('home-page.create-title')"
          :name="$t('home-page.create-name')"
          :description="$t('home-page.create-description')"
          @active="router.push($routes.generate)"
        />
      </div>
      <div class="home__content">
        <div class="home__content-template">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home-page.template-list-title') }}</h3>
            <app-button color="info" :text="$t('home-page.get-all-btn-text')" />
          </div>
          <div class="home-page__items">
            <div class="home-page__item-mock"></div>
            <div class="home-page__item-mock"></div>
            <div class="home-page__item-mock"></div>
          </div>
        </div>
        <div class="home__content-certificates">
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

          <div v-if="!certificates.length" class="home-page__items">
            <div class="= home-page__item-mock"></div>
            <div class="home-page__item-mock"></div>
            <div class="home-page__item-mock"></div>
          </div>
          <div v-else class="home-page__items">
            <div
              v-for="(item, key) in certificates.slice(
                0,
                MAX_CERTIFICATES_ON_PAGE,
              )"
              :key="key"
            >
              <home-certificate-item
                :img="item.img"
                :title="item.participant"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <loader-modal v-model:is-shown="isLoading" v-model:text="processState" />
    <auth-modal
      v-model:is-shown="isUnauthorized"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  HomeCertificateItem,
  AppButton,
  LoaderModal,
  AuthModal,
  HomeNavigation,
} from '@/common'
import { router } from '@/router'
import { CertificateJSONResponse } from '@/types'
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { UpdateAuthCodeAPICall, UploadCertificatesAPICall } from '@/api/api'
import { ErrorHandler } from '@/helpers'

const MAX_CERTIFICATES_ON_PAGE = 3

const { t } = useI18n()
const userState = useUserStore()

const certificates = ref([] as CertificateJSONResponse[])
const isUnauthorized = ref(false)
const authLink = ref('')
const isLoading = ref(false)
const processState = ref('')

const getCertificates = async () => {
  isLoading.value = true
  processState.value = t('home-page.process-state-getting-cert')

  try {
    certificates.value = await UploadCertificatesAPICall(
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
  } catch (error) {
    if (error.meta) {
      authLink.value = error.meta.auth_link
    }
    if (error.status === '500') {
      ErrorHandler.process('errors.failed-get-certificates')
    }
    isUnauthorized.value = true
  }
  isLoading.value = false
}

const updateCode = async (code: string) => {
  await UpdateAuthCodeAPICall(code, userState.userSetting.accountName)
  isUnauthorized.value = false
}

getCertificates()
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  margin: 0 auto;
}

.home-page__body-nav {
  display: grid;
  gap: toRem(150);
  grid-template-columns: repeat(2, 1fr);
}

.home-page__body-nav-item {
  margin: toRem(20) 0;
  max-width: toRem(550);
  width: 100%;
}

.home-page__items {
  display: flex;
  max-height: toRem(222);
  min-height: toRem(200);
  height: 100%;
  width: 100%;
  justify-content: space-between;
}

.home-page__item {
  width: toRem(300);
  height: toRem(222);
  border-radius: toRem(8);
  background: var(--background-primary-dark);
}

.home-page__item-mock {
  width: toRem(300);
  height: toRem(222);
  border-radius: toRem(8);
  background: var(--background-primary-dark);

  @include respond-to(xmedium) {
    width: toRem(250);
    height: toRem(170);
  }

  @include respond-to(medium) {
    width: toRem(200);
    height: toRem(150);
  }
}

.home-page__content-subtitle {
  display: flex;
  justify-content: space-between;
  margin: toRem(20) 0;
}
</style>
