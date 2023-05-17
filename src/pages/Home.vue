<template>
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
          <h3>{{ templateListTitle }}</h3>
          <app-button :text="'see more'" />
        </div>
        <div class="home__items">
          <div v-if="templates === undefined">
            <div>
              <div class="home__item-mock"></div>
            </div>
          </div>
          <div class="home__item-mock"></div>
          <div
            v-for="(item, key) in templates.slice(0, 4)"
            :value="key"
            :key="item"
          >
            <home-item :img="item.backgroundImg" :title="item.templateName" />
          </div>
        </div>
      </div>
      <div class="home__content-certificates">
        <div class="home__content-subtitle">
          <h3>{{ certificatesTitle }}</h3>

          <app-button
            :text="'see more'"
            :route="{
              name: $routes.certificates,
            }"
          />
        </div>

        <div class="home__items">
          <error-message
            v-if="certificates === undefined"
            :message="$t('home.error-certificate-nil')"
          />
          <div
            v-else
            v-for="(item, key) in certificates.slice(0, 4)"
            :value="key"
            :key="item"
          >
            <home-item
              class="home__item"
              :img="item.img"
              :title="item.participant"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import HomeBodyNav from '@/common/HomeNav.vue'

const homeCreate = 'Create New'

import { AppNavbar, HomeItem, AppButton } from '@/common'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import {
  CreateTemplateResponse,
  TemplateRequestData,
  UserJSONResponse,
  UserJSONResponseList,
} from '@/types'
import { ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'
import ErrorMessage from '@/common/ErrorMessage.vue'

const templates = ref([] as TemplateRequestData[])
const certificates = ref([] as UserJSONResponse[])

const isUnauthorized = ref(false)
const authLink = ref('')
const userState = useUserStore()
const isModalActive = ref(false)
let currentUser: UserJSONResponse

const templateListTitle = 'My templates'
const certificatesTitle = 'Previously certificates'

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
  } catch ({ ...err }) {
    if (err.name === 'ForbiddenError') {
      console.log('err')
      try {
        const { data } = await api.put('/integrations/ccp/users/token', {
          body: {
            data: {
              name: userState.setting.name,
            },
          },
        })
        console.log(data, ' data')
      } catch (err) {
        console.log('internal  err ', err)
      }
    }
  }
}

const getTemplates = async () => {
  const { data } = await api.get<TemplateRequestData[]>(
    '/integrations/ccp/certificate/template/' + userState.setting.name,
  )

  templates.value = prepareTemplateImg(data)

  //todo check error
}

const closeModal = () => {
  isUnauthorized.value = false
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
  //todo  move to  helpers
  for (const user of users) {
    console.log('user ', user)
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }
  return users
}

const prepareTemplateImg = (templates: TemplateRequestData[]) => {
  //todo  move to  helpers
  for (const template of templates) {
    console.log('user ', template)
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
  //width: toRem(602);
}

.home__items {
  display: flex;
  justify-content: space-around;
  padding: toRem(20);
}

.home__item-mock {
  width: toRem(314);
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
