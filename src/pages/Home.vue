<template>
  <div v-else-if="isUnauthorized">
    <auth-modal
      :token-link="authLink"
      @close-modal="closeModal"
      @with-code="updateCode"
    />
  </div>
  <div class="home">
    <app-header />
    <div class="home__body">
      <h1>{{ homeCreate }}</h1>
      <div class="home__body-create">
        <home-body-nav @active="goToCreate" />
        <home-body-nav @active="goToTemplate" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import HomeBodyNav from '@/common/HomeBodyNav.vue'

const homeCreate = 'Create New'

import AppHeader from '@/common/AppHeader.vue'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import {
  CreateTemplateResponse,
  UnauthorizedResponse,
  UserJSONResponseList,
} from '@/types'
import { ref } from 'vue'
import { api } from '@/api'
import { useUsersModules } from '@/store'
import AuthModal from "@/common/AuthModal.vue";

const templates = ref({})

const isUnauthorized = ref(false)
const authLink = ref('')
const userSetting = useUsersModules()

const getUsers = async () => {
  const resp = await api
    .post<UserJSONResponseList | UnauthorizedResponse>(
      '/integrations/ccp/users/',
      {
        data: {
          name: userSetting.setting.Name,
          url: userSetting.setting.Url,
        },
      },
    )
    .then( resp => {
      return resp
    })
    .catch(err => {
      if (err.response.data.data.attributes.link) {
        isUnauthorized.value = true
        authLink.value = err.response.data.data.attributes.link
      }
    })

  resp


}

const goToTemplate = () => {
  router.push(ROUTE_NAMES.template)
}

const goToCreate = () => {
  router.push(ROUTE_NAMES.create)
}

const cancel = async () => {
  await router.push(ROUTE_NAMES.menu)
}

const closeModal = () => {
  isUnauthorized.value = false
}

const updateCode = async (code: string) => {
  isUnauthorized.value = false
  await api.post<UserJSONResponseList>('/integrations/ccp/users/settings', {
    data: {
      code: code,
      name: userSetting.setting.Name,
    },
  })
</script>

<style scoped lang="scss">
.home__body-create {
  display: flex;
  justify-content: space-between;
}

.home__body
</style>
