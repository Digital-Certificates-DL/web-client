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
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { GenerationForm } from '@/forms'
import { AuthModal, LoaderModal } from '@/common'
import { updateAuthCode } from '@/api/api'

const authLink = ref('')
const loaderState = ref('')

const isAuthModalShown = ref(false)
const userState = useUserStore()
const isLoaderModalShown = ref(false)

const updateLoaderState = (state: string) => {
  loaderState.value = state
}

const updateCode = (code: string) => {
  updateAuthCode(code, userState.userSetting.accountName)
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
