<template>
  <div class="home-page">
    <div class="home-page__body">
      <h2>{{ $t('home.title') }}</h2>
      <div class="home-page__body-nav">
        <home-body-nav
          class="home-page__body-nav-item"
          :title="$t('home.upload-title')"
          :name="$t('home.upload-name')"
          :description="$t('home.upload-description')"
          @active="router.push($routes.template)"
        />
        <home-body-nav
          class="home-page__body-nav-item"
          :title="$t('home.create-title')"
          :name="$t('home.create-name')"
          :description="$t('home.create-description')"
          @active="router.push($routes.generate)"
        />
      </div>
      <div class="home__content">
        <div class="home__content-template">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home.template-list-title') }}</h3>
            <app-button color="info" :text="$t('home.get-all-btn')" />
          </div>
          <div class="home-page__items">
            <div class="home-page__item-mock"></div>
            <div class="home-page__item-mock"></div>
            <div class="home-page__item-mock"></div>
          </div>
        </div>
        <div class="home__content-certificates">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home.certificate-list-title') }}</h3>

            <app-button
              color="info"
              :text="$t('home.get-all-btn')"
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
            <div v-for="item in certificates.slice(0, 3)" :key="item">
              <home-item :img="item.img" :title="item.participant" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />
    <auth-modal
      v-model:is-shown="isUnauthorized"
      class="test"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  HomeItem,
  AppButton,
  LoaderModal,
  AuthModal,
  HomeBodyNav,
} from '@/common'
import { router } from '@/router'
import { CertificateJSONResponse } from '@/types'
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { useUpdateCode, useUploadCertificates } from '@/api/api'

const { t } = useI18n()
const userState = useUserStore()

const certificates = ref([] as CertificateJSONResponse[])
const isUnauthorized = ref(false)
const authLink = ref('')
const isLoading = ref(false)
const processState = ref('')

const getCertificates = async () => {
  try {
    isLoading.value = true
    processState.value = t('home.process-state-getting-cert')

    const data = await useUploadCertificates(
      userState.userSetting.accountName,
      userState.userSetting.urlGoogleSheet,
    )
    if (!data) {
      return
    }
    certificates.value = data
  } catch (error) {
    authLink.value = error.meta.auth_link
    isUnauthorized.value = true
  }
  isLoading.value = false
}

const updateCode = async (code: string) => {
  await useUpdateCode(code, userState.userSetting.accountName)
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
  display: flex;
  justify-content: space-between;
}

.home-page__body-nav-item {
  margin: toRem(20) 0;
  width: 47%;
  max-height: toRem(150);
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

.test {
  max-width: toRem(600);
  max-height: toRem(600);
  width: 100%;
  height: 100%;
}
</style>
