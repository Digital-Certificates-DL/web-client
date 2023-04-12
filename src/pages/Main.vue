<template>
  <div class="main-page">
    <div class="main-page__info">
      <span class="main-page__info-logo"> LOGO </span>
      <span class="main-page__info-name">Service name</span>
      <h3>
        Ac integer sapien nisl turpis arcu integer. Pellentesque phasellus egestas pharetra quam cursus
      </h3>
    </div>
    <div class="main-page__body">
      <div class="main-page__provider-side">

        <template v-if="isLoaded">
          <template v-if="isLoadFailed">
            <error-message :message="$t('web3-page.loading-error-msg')" />
          </template>
          <template v-else>
            <div
              v-if="!metamaskProvider.isConnected.value"
              class="main-page__metamask"
            >
              <p class="main-page__metamask-title">Connect to MetaMask</p>
              <p class="main-page__metamask-definition">
                Ac integer sapien nisl turpis arcu integer. Pellentesque  phasellus egestas pharetra quam cursus
              </p>
              <app-button
                scheme="flat"
                size="small"
                class="web3-page__card-btn"
                :text="metamaskProvider.selectedAddress.value || 'Connect'"
                @click="connect(metamaskProvider)"
                :disabled="metamaskProvider.isConnected.value"
              />
              <app-button
                v-if="metamaskProvider.isConnected.value"
                class="web3-page__card-btn"
                :text="'Disconnect'"
                scheme="flat"
                color="error"
                size="small"
                @click="metamaskProvider.disconnect"
              />
            </div>
            <div v-else class="main-page__metamask">
              <span class="web3-page__txt">
                {{ `chainId: ${metamaskProvider.chainId.value}` }}
              </span>
              <app-button
                scheme="flat"
                size="small"
                class="web3-page__card-btn"
                :text="metamaskProvider.selectedAddress.value || 'Connect'"
                @click="connect(metamaskProvider)"
                :disabled="metamaskProvider.isConnected.value"
              />
              <!--          todo  delete this button-->
              <app-button
                class="complex-form__submit-btn"
                type="submit"
                scheme="flat"
                text="mint"
                size="small"
                @click="mint"
              />
              <!--          ^-->
              <app-button
                v-if="metamaskProvider.isConnected.value"
                class="web3-page__card-btn"
                :text="'Disconnect'"
                scheme="flat"
                color="error"
                size="small"
                @click="metamaskProvider.disconnect"
              />
            </div>
          </template>
        </template>
        <template v-else>
          <loader />
        </template>
      </div>
      <div class="main-page__endpoints-side">
        <app-button
          :text="'Settings'"
          class="setting btn"
          scheme="flat"
          size="small"
          @click="goToSetting"
        />
        <app-button
          :text="'Certificates'"
          class="certificates btn"
          scheme="flat"
          size="small"
          @click="goToCertificate"
        />
        <app-button
          class="template btn"
          :text="'Template'"
          scheme="flat"
          size="small"
          @click="goToTemplate"
        />
        <app-button
          :text="'Generation'"
          class="generation btn"
          scheme="flat"
          size="small"
          @click="goToGenerate"
        />
        <app-button
          :text="'bitcoin'"
          class="generation btn"
          scheme="flat"
          size="small"
          @click="sendTx"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {AppButton, Loader, ErrorMessage} from '@/common'
import { computed, ref } from 'vue'
import { useWeb3ProvidersStore } from '@/store'

import { useProvider, useErc721 } from '@/composables'
import { ErrorHandler } from '@/helpers'
import { UseProvider } from '@/types'
import { PROVIDERS, ROUTE_NAMES } from '@/enums'
import { router } from '@/router'
import btc from '@/utils/bitcoin.util'

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
      console.log(web3Store.providers)
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
    'https://ipfs.io/ipfs/bafybeihdmrxl4bq3hn2jhcpz2ecyre53dhfolhstowm6jw6bzzfqzs5fbm',
  )
}

const safeMint = async (recipient: string, uri: string) => {
  await certificateSBT.safeMint(recipient, uri)
}

const goToCertificate = () => {
  router.push(ROUTE_NAMES.certificates)
}
const goToSetting = () => {
  router.push(ROUTE_NAMES.setting)
}

const goToTemplate = () => {
  router.push(ROUTE_NAMES.template)
}

const goToGenerate = () => {
  router.push(ROUTE_NAMES.create)
}

const sendTx = async () => {
  console.log('start')
  const i = 5
  const tx = await btc.Bitcoin.PrepareTXTestnet(
    'tenant else strategy such toward slogan spawn faculty helmet awkward figure stamp',
    i,
  )

  console.log('pr')
  console.log(tx)
  const res = await btc.Bitcoin.SendToTestnet(tx?.hex || '')
  console.log(res)
}

init()
</script>

<style lang="scss" scoped>
.main_page{
  display: flex;
  justify-items: center;
}

.main-page__info {
  display: grid;
  margin-top: toRem(80);
  grid-row: span;
  justify-content:center;
  padding-bottom: toRem(100);
}


.main-page__info-name{
  margin: auto;
  font-size: toRem(25);

}
.main-page__svc-info {
  margin-top: toRem(27);
  display: block;
  place-items: center;
}

.main-page__info-logo {
  margin: auto;
  font-size: toRem(25);

}


.main-page__body {
  display: flex;
  align-content: center;
  justify-content: space-between;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(143, 189, 255, 0.38) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0.6;
}

.main-page__metamask {
  display: grid;
  place-content: center;
  border: toRem(1) solid var(--border-primary-main);
  //grid-template-columns: 1fr 1fr 1fr;
  //grid-gap: toRem(24);
  //margin-bottom: toRem(24);
  border-radius: toRem(8);
  padding: toRem(12);
  width: toRem(642);
  height: toRem(432);
}

.main-page__endpoints-side {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 50px;
  grid-auto-rows: toRem(100);
}

.main-page__metamask-title {
  font-size: toRem(35);
  margin: auto;
}

.main-page__metamask-definition {
  text-align: center;
  font-size:toRem(20);
}

.btn {
  min-width: toRem(250);
}

.template {
  background: #97ecff;
}

.certificates {
  background: #d5a9ff;
}

.setting {
  background: #8fffdd;
}

.generation {
  background: #8fbdff;
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
