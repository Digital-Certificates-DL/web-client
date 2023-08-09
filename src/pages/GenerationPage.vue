<template>
  <div class="generation-page">
    <div class="generation-page__title">
      <h2>{{ $t('generation-page.title') }}</h2>
    </div>
    <generation-form
      v-model:is-loader-shown="isLoaderModalShown"
      @update-loader-state="updateLoaderState"
      @auth="auth"
    />

    <auth-modal
      v-model:is-shown="isAuthModalShown"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />

    <loader-modal :is-shown="isLoaderModalShown" :state="loaderState" />
  </div>
</template>

<script lang="ts" setup>
import { api } from '@/api'
import { CertificateJSONResponseList } from '@/types'
import { ErrorHandler } from '@/helpers'
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { GenerationForm } from '@/forms'
import { AuthModal, LoaderModal } from '@/common'

const authLink = ref('')
const loaderState = ref('')

const isAuthModalShown = ref(false)
const userState = useUserStore()
const isLoaderModalShown = ref(false)

const updateCode = async (code: string) => {
  //TODO move it to  api
  try {
    isAuthModalShown.value = false
    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      {
        body: {
          data: {
            attributes: {
              code: code,
              name: userState.setting.accountName,
            },
          },
        },
      },
    )
  } catch (error) {
    ErrorHandler.process(error)
    return
  }
}

const updateLoaderState = (state: string) => {
  loaderState.value = state
}

const auth = (link: string) => {
  authLink.value = link
  isAuthModalShown.value = true
}
</script>

<style lang="scss" scoped>
.generation-page {
  margin: 0 auto;
  width: 100%;
}
</style>
