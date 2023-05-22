<template>
  <auth-modal
    :token-link="authLink"
    @with-code="updateCode"
    :is-shown="isUnauthorized"
  />
  <div class="home">
    <div class="home__body">
      <h2>{{ $t('home.title') }}</h2>
      <div class="home__body-nav">
        <home-body-nav
          class="home__body-nav-item"
          @active="router.push(ROUTE_NAMES.generate)"
          :title="$t('home.create-title')"
          :name="$t('home.create-name')"
          :description="$t('home.create-description')"
        />
        <home-body-nav
          class="home__body-nav-item"
          @active="router.push(ROUTE_NAMES.template)"
          :title="$t('home.upload-title')"
          :name="$t('home.upload-name')"
          :description="$t('home.upload-description')"
        />
      </div>
    </div>
    <div class="home__content">
      <div class="home__content-template">
        <div class="home__content-subtitle">
          <h3>{{ $t('home.template-list-title') }}</h3>
          <app-button :text="$t('home.get-all-btn')" />
        </div>
        <div>
          <div v-if="templates.length === 0" class="home__items">
            <div class="home__item home__item-mock"></div>
            <div class="home__item home__item-mock"></div>
            <div class="home__item home__item-mock"></div>
          </div>
          <div v-else class="home__items">
            <div
              v-for="(item, key) in templates.slice(0, 4)"
              :value="key"
              :key="item"
            >
              <home-item :img="item.backgroundImg" :title="item.templateName" />
            </div>
          </div>
        </div>
      </div>
      <div class="home__content-certificates">
        <div class="home__content-subtitle">
          <h3>{{ $t('home.certificate-list-title') }}</h3>

          <app-button
            :text="$t('home.get-all-btn')"
            :route="{
              name: $routes.certificates,
            }"
          />
        </div>

        <div v-if="templates.length === 0" class="home__items">
          <div class="= home__item-mock"></div>
          <div class="home__item-mock"></div>
          <div class="home__item-mock"></div>
        </div>
        <div v-else class="home__items">
          <div
            v-for="(item, key) in templates.slice(0, 4)"
            :value="key"
            :key="item"
          >
            <home-item :img="item.backgroundImg" :title="item.templateName" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import HomeBodyNav from '@/common/HomeNav.vue'

import { HomeItem, AppButton } from '@/common'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import {
  TemplateRequestData,
  UserJSONResponse,
  UserJSONResponseList,
} from '@/types'
import { ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'
import AuthModal from '@/common/modals/AuthModal.vue'
import { ErrorHandler } from '@/helpers'

const templates = ref([] as TemplateRequestData[])
const certificates = ref([] as UserJSONResponse[])

const isUnauthorized = ref(false)
const authLink = ref('')
const userState = useUserStore()

const getUsers = async () => {
  try {
    const { data } = await api.post<UserJSONResponse[]>(
      '/integrations/ccp/users/',
      {
        body: {
          data: {
            name: userState.setting.name,
            url: userState.setting.url,
          },
        },
      },
    )
    certificates.value = prepareUserImg(data)
    return
  } catch (err) {
    if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      try {
        const { data } = await api.post('/integrations/ccp/users/token', {
          body: {
            data: {
              name: userState.setting.name,
              code: '',
            },
          },
        })
        authLink.value = data.link
        isUnauthorized.value = true
      } catch (error) {
        ErrorHandler.process(error)
      }
    }
  }
}

const getTemplates = async () => {
  if (userState.setting.name === undefined) {
    templates.value = []
    return
  }
  const resp = await api.get<TemplateRequestData[]>(
    '/integrations/ccp/certificate/template/' + userState.setting.name,
  )

  templates.value = prepareTemplateImg(resp.data)
}

const updateCode = async (code: string) => {
  isUnauthorized.value = false
  await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
    body: {
      data: {
        code: code,
        name: userState.setting.name,
      },
    },
  })
}

const prepareUserImg = (users: UserJSONResponse[]) => {
  for (const user of users) {
    if (user.certificateImg == null) {
      continue
    }
    user.img = 'data:image/png;base64,' + user.certificateImg
  }
  return users
}

const prepareTemplateImg = (templates: TemplateRequestData[]) => {
  for (const template of templates) {
    if (temaplte.backgroundImg === null) {
      continue
    }
    template.backgroundImg = 'data:image/png;base64,' + template.backgroundImg
  }
  return templates
}

getUsers()
getTemplates()
</script>

<style scoped lang="scss">
.home {
  width: var(--page-large);
  margin: 0 auto;
}

.home__body-nav {
  display: flex;
  justify-content: space-between;
}

.home__body-nav-item {
  margin: toRem(10);
}

.home__items {
  display: flex;
  justify-content: space-between;
}

.home__item-mock {
  width: toRem(300);
  height: toRem(222);
  border-radius: toRem(8);
  background: var(--background-primary-dark);
}

.home__content-subtitle {
  display: flex;
  justify-content: space-between;
  margin: toRem(20) 0;
}
</style>
