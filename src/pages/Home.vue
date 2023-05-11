<template>
  <div class="home">
    <app-navbar />
    <div class="home__body">
      <h1>{{ homeCreate }}</h1>
      <div class="home__body-create">
        <home-body-nav
          @active="router.push(ROUTE_NAMES.generate)"
          :title="'Create'"
          :name="'Create'"
          :description="'Purus ullamcorper quisque pellentesque sit malesuada pharetra odio. Massa enim in arcu sagittis dictum sodales.'"
        />
        <home-body-nav
          @active="router.push(ROUTE_NAMES.template)"
          :title="'Upload new template'"
          :name="'Upload'"
          :description="'Purus ullamcorper quisque pellentesque sit malesuada pharetra odio. Massa enim in arcu sagittis dictum sodales.'"
        />
      </div>
    </div>
    <div class="home__content">
      <div class="home__content-template">
        <div class="home__content-subtitle">
          <p>{{ templateListTitle }}</p>
          <app-button :text="'see more'" :route="certificates" />
        </div>

        <!--        <div v-if="certificates.data.length === 0">-->
        <!--          <error-message :message="'You have not template'" />-->
        <!--        </div>-->
        <div class="home__items">
          <div v-for="(item, key) in templates" :value="key" :key="item">
            <home-item :img="item.img" :title="item.template_name" />
          </div>
        </div>
      </div>
      <div class="home__content-certificates">
        <div class="home__content-subtitle">
          <p>{{ certificatesTitle }}</p>

          <app-button
            :text="'see more'"
            :route="{
              name: $routes.certificates,
            }"
          />
        </div>
        <!--          <div v-if="certificates.data.length === 0">-->
        <!--            <error-message message="'You have not certificates'" />-->
        <!--          </div>-->

        <div class="home__items">
          <div
            v-for="(item, key) in certificates.slice(0, 4)"
            :value="key"
            :key="item"
          >
            <home-item
              class="home__item"
              :img="item.Img"
              :title="item.Participant"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import HomeBodyNav from '@/common/HomeBodyNav.vue'

const homeCreate = 'Create New'

import { AppNavbar, HomeItem, AppButton } from '@/common'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import {
  CreateTemplateResponse,
  UserJSONResponse,
  UserJSONResponseList,
} from '@/types'
import { ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'

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
  const { data } = await api.post<UserJSONResponseList>(
    '/integrations/ccp/users/',
    {
      body: {
        data: {
          name: userState.setting.Name,
          url: userState.setting.Url,
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
  certificates.value = data
}

const getTemplates = async () => {
  const { data } = await api.get<CreateTemplateResponse>(
    '/integrations/ccp/certificate/template/' + userState.setting.Name,
  )
  console.log(data)

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
        name: userState.setting.Name,
      },
    },
  })
}

const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser = user
}

// const prepareUserImg = (users: UserJSONResponseList) => {
//   //todo  move to  helpers
//   for (const user of users.data) {
//     user.attributes.Img =
//       'data:image/png;base64,' + user.attributes.CertificateImg.toString()
//   }
//   return users
// }

getUsers()
getTemplates()
</script>

<style scoped lang="scss">
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
