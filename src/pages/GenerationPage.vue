<template>
  <div class="generation-page">
    <div class="generation-page__title">
      <h2>{{ $t('generation-page.title') }}</h2>
    </div>
    <generation-form
      v-model:is-loader-shown="isLoaderModalShown"
      :container-id="validationContainerID"
      :is-revalidate-container="isRevalidateContainer"
      @update-loader-text="updateLoaderText"
      @auth="auth"
      @validation-rate-limit="handleValidateContainerError"
    />

    <auth-modal
      v-model:is-shown="isAuthModalShown"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />

    <loader-modal :is-shown="isLoaderModalShown" :text="loaderText" />
    <container-error-modal
      :is-shown="isContainerErrorModalShown"
      :container-id="validationContainerID"
      @try-again="revalidateContainer"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { GenerationForm } from '@/forms'
import { AuthModal, LoaderModal, ContainerErrorModal } from '@/common'
import { updateAuthCode } from '@/api'
import { ErrorHandler } from '@/helpers'

const authLink = ref('')
const loaderText = ref('')

const isAuthModalShown = ref(false)
const userState = useUserStore()
const isLoaderModalShown = ref(false)
const isContainerErrorModalShown = ref(false)
const isRevalidateContainer = ref(false)
const validationContainerID = ref('')

const updateLoaderText = (text: string) => {
  loaderText.value = text
}

const updateCode = (code: string) => {
  try {
    updateAuthCode(code, userState.userSetting.accountName)
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const handleValidateContainerError = (containerID: string) => {
  isRevalidateContainer.value = false
  validationContainerID.value = containerID
  isContainerErrorModalShown.value = true
}

const revalidateContainer = (containerID: string) => {
  validationContainerID.value = containerID
  isContainerErrorModalShown.value = false
  isRevalidateContainer.value = true
  isLoaderModalShown.value = true
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
