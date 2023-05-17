<template>
  <div class="home">
    <div class="home__body">
      <h2>{{ $t('home.title') }}</h2>
      <div class="home__body-create">
        <home-body-nav
          @active="router.push(ROUTE_NAMES.generate)"
          :title="$t('home.create-title')"
          :name="$t('home.create-name')"
          :description="$t('home.create-description')"
        />
        <home-body-nav
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
          <h2>{{ templateListTitle }}</h2>
          <app-button :text="'see more'" />
        </div>
        <div class="home__items">
          <error-message
            v-if="templates === undefined"
            :message="$t('home.error-templates-nil')"
          />
          <div
            v-else
            v-for="(item, key) in templates.slice(0, 4)"
            :value="key"
            :key="item"
          >
            <home-item :img="item.img" :title="item" />
          </div>
        </div>
      </div>
      <div class="home__content-certificates">
        <div class="home__content-subtitle">
          <h2>{{ certificatesTitle }}</h2>

          <app-button
            :text="'see more'"
            :route="{
              name: $routes.certificates,
            }"
          />
        </div>

        <div class="home__items">
          <error-message
            v-if="templates === undefined"
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

const templates = ref([])
const certificates = ref([] as UserJSONResponse[])

const isUnauthorized = ref(false)
const authLink = ref('')
const userState = useUserStore()
const isModalActive = ref(false)
let currentUser: UserJSONResponse

const templateListTitle = 'My templates'
const certificatesTitle = 'Previously certificates'

const getUsers = async () => {
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
  // .catch(err => {
  //   if (err.response.data.data.attributes.link) {
  //     isUnauthorized.value = true
  //     authLink.value = err.response.data.data.attributes.link
  //   }
  // })

  certificates.value = prepareUserImg(data)
}

const getTemplates = async () => {
  const { data } = await api.get<TemplateRequestData>(
    '/integrations/ccp/certificate/template/' + userState.setting.name,
  )

  templates.value = data

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

const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser = user
}

const prepareUserImg = (users: UserJSONResponse[]) => {
  //todo  move to  helpers
  for (const user of users) {
    console.log('user ', user)
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }
  return users
}

getUsers()
getTemplates()
</script>

<style scoped lang="scss">
.home {
  max-width: var(--page-large);
  margin: 0 auto;
}

.home__body-create {
  display: flex;
  justify-content: space-between;
}
.home__items {
  display: flex;
  justify-content: space-around;
  padding: toRem(20);
}

.home__content-subtitle {
  display: flex;
  justify-content: space-between;
  margin: toRem(20) 0;
}
</style>
