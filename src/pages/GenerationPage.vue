<template>
  <div class="generation-page">
    <auth-modal
      v-model:is-shown="isAuthModalShown"
      :token-link="authLink"
      @send-auth-code="updateCode"
    />
    <div class="generation-page__title">
      <h2>{{ $t('generation-page.title') }}</h2>
    </div>
    <generation-form @auth="auth" />
  </div>
</template>

<script lang="ts" setup>
import { api } from '@/api'
import { CertificateJSONResponseList } from '@/types'
import { ErrorHandler } from '@/helpers'
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { GenerationForm } from '@/forms'
import { AuthModal } from '@/common/modals'

const authLink = ref('')

const isAuthModalShown = ref(false)
const userState = useUserStore()

const updateCode = async (code: string) => {
  try {
    isAuthModalShown.value = false
    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      {
        body: {
          data: {
            code: code,
            name: userState.userSetting.accountName,
          },
        },
      },
    )
  } catch (error) {
    ErrorHandler.process(error)
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
