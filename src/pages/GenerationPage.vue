<template>
  <div class="generation-page">
    <auth-modal
      v-model:is-shown="isUnauthorized"
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

const isUnauthorized = ref(false)
const userState = useUserStore()

const updateCode = async (code: string) => {
  //TODO move it to  api
  try {
    isUnauthorized.value = false
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

const auth = (code: string) => {
  authLink.value = code
  isUnauthorized.value = true
}
</script>

<style lang="scss" scoped>
.generation-page {
  width: 100%;
  margin: 0 auto;
}
</style>
