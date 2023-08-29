<template>
  <div class="generation-page">
    <div class="generation-page__title">
      <h2>{{ $t('generation-page.title') }}</h2>
    </div>
    <generation-form
      v-model:is-loader-shown="isLoaderModalShown"
      @update-loader-text="updateLoaderText"
      @auth="auth"
    />

    <auth-modal
      v-model:is-shown="isAuthModalShown"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />

    <loader-modal :is-shown="isLoaderModalShown" :text="loaderText" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { GenerationForm } from '@/forms'
import { AuthModal, LoaderModal } from '@/common'
import { UpdateAuthCode } from '@/api/api'
import { ErrorHandler } from '@/helpers'

const authLink = ref('')
const loaderText = ref('')

const isAuthModalShown = ref(false)
const userState = useUserStore()
const isLoaderModalShown = ref(false)

const updateLoaderText = (text: string) => {
  loaderText.value = text
}

const updateCode = (code: string) => {
  try {
    UpdateAuthCode(code, userState.userSetting.accountName)
  } catch (error) {
    ErrorHandler.process('errors.failed-call-api')
  }
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
