<template>
  <div class="home-page">
    <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />

    <auth-modal
      v-model:is-shown="isUnauthorized"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />

    <div class="home-page__body">
      <h2>{{ $t('home.title') }}</h2>
      <div class="home-page__body-nav">
        <home-body-nav
          class="home-page__body-nav-item"
          :title="$t('home.upload-title')"
          :name="$t('home.upload-name')"
          :description="$t('home.upload-description')"
          @active="router.push(ROUTE_NAMES.template)"
        />
        <home-body-nav
          class="home-page__body-nav-item"
          :title="$t('home.create-title')"
          :name="$t('home.create-name')"
          :description="$t('home.create-description')"
          @active="router.push(ROUTE_NAMES.generate)"
        />
      </div>
      <div class="home__content">
        <div class="home__content-template">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home.template-list-title') }}</h3>
            <app-button color="info" :text="$t('home.get-all-btn')" />
          </div>
          <div>
            <div class="home-page__items">
              <div class="home__item home-page__item-mock"></div>
              <div class="home__item home-page__item-mock"></div>
              <div class="home__item home-page__item-mock"></div>
            </div>
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
  </div>
</template>

<script lang="ts" setup>
import {
  HomeItem,
  AppButton,
  LoaderModal,
  AuthModal,
  HomeBodyNav,
} from '@/common'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { CertificateJSONResponse } from '@/types'
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { ErrorHandler } from '@/helpers'
import {
  useGetUpdateLink,
  useUpdateCode,
  useUploadCertificates,
} from '@/api/api'

const certificates = ref([] as CertificateJSONResponse[])

const isUnauthorized = ref(false)
const authLink = ref('')
const userState = useUserStore()

const isLoading = ref(false)
const processState = ref('')

const getCertificates = async () => {
  try {
    isLoading.value = true
    processState.value = 'Getting certificates'

    const data = await useUploadCertificates(
      userState.setting.accountName,
      userState.setting.urlGoogleSheet,
    )
    if (!data) {
      return
    }
    certificates.value = data
  } catch (error) {
    switch (error.name) {
      case 'ForbiddenError':
        authLink.value = error.meta.auth_link
        isUnauthorized.value = true
        break
      case 'UnauthorizedError':
        try {
          const data = await useGetUpdateLink(userState.setting.accountName)
          if (!data) {
            //todo  localization
            return
          }
          //todo  impleemnt types for it
          authLink.value = data.link
          isUnauthorized.value = true
          return
        } catch (err) {
          ErrorHandler.process(err)
          return
        }
      default:
        if (!userState.setting.urlGoogleSheet) {
          await router.push(ROUTE_NAMES.settings)
        }
        break
    }
  } finally {
    isLoading.value = false
  }
}

const updateCode = async (code: string) => {
  await useUpdateCode(code)
  isUnauthorized.value = false
}

getCertificates()
</script>

<style scoped lang="scss">
.home-page {
  max-width: var(--page-large);
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
  height: toRem(150);

  @include respond-to(xmedium) {
    height: toRem(130);
    width: 47%;
  }
}

.home-page__items {
  display: flex;
  max-height: toRem(222);
  height: 100%;
  justify-content: space-between;
}

.home-page__item-mock {
  max-width: toRem(300);
  width: 100%;
  max-height: toRem(222);
  height: 100%;
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
