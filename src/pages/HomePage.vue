<template>
  <div class="home-page">
    <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />

    <auth-modal
      :token-link="authLink"
      @send-auth-code="updateCode"
      v-model:is-shown="isUnauthorized"
    />

    <div class="home-page__body">
      <h2>{{ $t('home.title') }}</h2>
      <div class="home-page__body-nav">
        <home-body-nav
          class="home-page__body-nav-item"
          @active="router.push(ROUTE_NAMES.template)"
          :title="$t('home.upload-title')"
          :name="$t('home.upload-name')"
          :description="$t('home.upload-description')"
        />
        <home-body-nav
          class="home-page__body-nav-item"
          @active="router.push(ROUTE_NAMES.generate)"
          :title="$t('home.create-title')"
          :name="$t('home.create-name')"
          :description="$t('home.create-description')"
        />
      </div>
      <div class="home__content">
        <div class="home__content-template">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home.template-list-title') }}</h3>
            <app-button color="info" :text="$t('home.get-all-btn')" />
          </div>
          <div>
            <div v-if="templates.length === 0" class="home-page__items">
              <div class="home__item home-page__item-mock"></div>
              <div class="home__item home-page__item-mock"></div>
              <div class="home__item home-page__item-mock"></div>
            </div>
            <div v-else class="home-page__items">
              <div
                v-for="(item, key) in templates.slice(0, 3)"
                :value="key"
                :key="item"
              >
                <home-item
                  :img="item.background_img || '/branding/template.png'"
                  :title="item.template_name"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="home__content-certificates">
          <div class="home-page__content-subtitle">
            <h3>{{ $t('home.certificate-list-title') }}</h3>

            <app-button
              :text="$t('home.get-all-btn')"
              color="info"
              :route="{
                name: $routes.certificates,
              }"
            />
          </div>

          <div v-if="certificates.length === 0" class="home-page__items">
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
import HomeBodyNav from '@/common/HomeNav.vue'

import { HomeItem, AppButton, LoaderModal } from '@/common'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { CertificateJSONResponse, CertificateJSONResponseList } from '@/types'
import { ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'
import AuthModal from '@/common/modals/AuthModal.vue'
import { ErrorHandler } from '@/helpers'

const templates = ref([] as TemplateRequestData[])
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
    const { data } = await api.post<CertificateJSONResponse[]>(
      '/integrations/ccp/users/',
      {
        body: {
          data: {
            name: userState.setting.accountName,
            url: userState.setting.urlGoogleSheet,
          },
        },
      },
    )
    if (data) {
      certificates.value = data
    }
    certificates.value
  } catch (error) {
    switch (error.name) {
      case 'ForbiddenError':
        authLink.value = error.meta.auth_link
        isUnauthorized.value = true
        break
      case 'UnauthorizedError':
        try {
          const { data } = await api.post('/integrations/ccp/users/token', {
            body: {
              data: {
                name: userState.setting.accountName,
              },
            },
          })

          authLink.value = data.link
          isUnauthorized.value = true

          return
        } catch (err) {
          ErrorHandler.process(err)
        }
        break
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
//
// const getCertificateImage = async (certificates:
// CertificateJSONResponse[]) => {
//   try {
//     isLoading.value = true
//     processState.value = 'Upload certificate image'
//     /* eslint-disable no-console */
//     console.log('userState.setting: ', userState.setting)
//     const { data } = await api.post<CertificateJSONResponse[]>(
//       '/integrations/ccp/certificate/image',
//       {
//         body: {
//           data: {
//             attributes: {
//               certificates_data: certificates,
//               address: userState.setting.userBitcoinAddress,
//               url: userState.setting.urlGoogleSheet,
//               name: userState.setting.accountName,
//             },
//           },
//         },
//       },
//     )
//     if (data) {
//       return data
//     }
//   } catch (error) {
//     ErrorHandler.process(error)
//   } finally {
//     isLoading.value = false
//   }
// }

const getTemplates = async () => {
  if (!userState.setting.accountName) {
    templates.value = []
    return
  }
  const { data } = await api.get<TemplateRequestData[]>(
    '/integrations/ccp/certificate/template/' + userState.setting.accountName,
  )
  if (data) {
    templates.value = prepareTemplateImg(data)
  }
}

const updateCode = async (code: string) => {
  isUnauthorized.value = false
  await api.post<CertificateJSONResponseList>(
    '/integrations/ccp/users/settings',
    {
      body: {
        data: {
          code: code,
          name: userState.setting.accountName,
        },
      },
    },
  )
}

const prepareTemplateImg = (templates: TemplateRequestData[]) => {
  for (const template of templates) {
    if (template.background_img == null) {
      continue
    }
    template.background_img = 'data:image/png;base64,' + template.background_img
  }
  return templates
}

getCertificates()
getTemplates()
</script>

<style scoped lang="scss">
.home-page {
  margin: 0 auto;
}

.home-page__body {
  width: var(--page-large);

  @include respond-to(large) {
    width: var(--page-xmedium);
  }

  @include respond-to(xmedium) {
    width: var(--page-medium);
  }
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
  justify-content: space-between;
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
