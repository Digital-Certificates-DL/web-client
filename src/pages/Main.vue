<template>
  <div class="web3-page">
    <template v-if="isLoaded">
      <template v-if="isLoadFailed">
        <error-message :message="$t('web3-page.loading-error-msg')" />
      </template>
      <template v-else>
        <div class="web3-page__list">
          <div
            class="web3-page__card"
            v-for="provider in providers"
            :key="provider.selectedProvider.value"
          >
            <div
              class="web3-page__card-indicator"
              :class="{
                'web3-page__card-indicator--active': provider.isConnected.value,
              }"
            />
            <h2 class="web3-page__card-title">
              {{ provider.selectedProvider.value }}
            </h2>
            <span class="web3-page__card-name">
              {{ provider.selectedAddress.value }}
            </span>
            <span class="web3-page__txt">
              {{ `chainId: ${provider.chainId.value}` }}
            </span>
            <app-button
              scheme="flat"
              size="small"
              class="web3-page__card-btn"
              :text="provider.selectedAddress.value || 'Connect'"
              @click="connect(provider)"
              :disabled="provider.isConnected.value"
            />
            <app-button
              class="complex-form__submit-btn"
              type="submit"
              text="mint"
              @click="mint"
            />

            <app-button
              v-if="provider.isConnected.value"
              class="web3-page__card-btn"
              :text="'Disconnect'"
              scheme="flat"
              color="error"
              size="small"
              @click="provider.disconnect"
            />
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <loader />
    </template>
    <div>
      <app-button :text="'settings'" scheme="flat" color="error" size="small" />
      <app-button
        :text="'Certificates'"
        scheme="flat"
        color="error"
        size="small"
      />
      <app-button :text="'Template'" scheme="flat" color="error" size="small" />
      <app-button
        :text="'Generation'"
        scheme="flat"
        color="error"
        size="small"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { AppButton, Loader, ErrorMessage } from '@/common'
import { reactive } from 'vue'
import { computed, ref } from 'vue'
import { useWeb3ProvidersStore } from '@/store'

import { useProvider, useErc721 } from '@/composables'
import { ErrorHandler } from '@/helpers'
import { UseProvider } from '@/types'
import { PROVIDERS } from '@/enums'
const form = reactive({
  address: '',
})

const isLoaded = ref(false)
const isLoadFailed = ref(false)

const web3Store = useWeb3ProvidersStore()

const providers: UseProvider[] = []

const certificateSBT = useErc721('0x0c4487b8a9dcB460C864293146D2056e2E53c680') //todo make better

const metamaskProvider = computed(() =>
  providers.find(el => el.selectedProvider.value === PROVIDERS.metamask),
)

const init = async () => {
  try {
    await web3Store.detectProviders()

    for (const designatedProvider of web3Store.providers) {
      const provider = useProvider()

      await provider.init(designatedProvider)

      if (provider.selectedProvider.value === PROVIDERS.metamask) {
        await web3Store.provider.init(designatedProvider)
      }
      providers.push(provider)
    }
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
    isLoadFailed.value = true
  }
  isLoaded.value = true
}

const connect = async (provider: UseProvider) => {
  try {
    await provider.connect()
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const mint = async () => {
  await safeMint(
    '0xD656fB4ffdbB09dE24Cd1F25fC323DEbF4FB0886',
    'ipfs://bafybeihdmrxl4bq3hn2jhcpz2ecyre53dhfolhstowm6jw6bzzfqzs5fbm',
  )
}

const safeMint = async (recipient: string, uri: string) => {
  await certificateSBT.safeMint(recipient, uri)
}

init()
</script>

<style lang="scss" scoped>
.web3-page {
  padding-bottom: toRem(100);
}

.web3-page__list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: toRem(24);
  margin-bottom: toRem(24);
}

.web3-page__card {
  position: relative;
  display: grid;
  gap: toRem(8);
  border: toRem(1) solid var(--border-primary-main);
  border-radius: toRem(8);
  padding: toRem(12);
}

.web3-page__card-indicator {
  position: absolute;
  top: toRem(12);
  right: toRem(12);
  width: toRem(12);
  height: toRem(12);
  border-radius: 50%;
  background: var(--error-main);

  &--active {
    background: var(--success-main);
  }
}

.web3-page__card-btn {
  width: 100%;
}
</style>
