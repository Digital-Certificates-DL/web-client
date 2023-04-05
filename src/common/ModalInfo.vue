<template>
  <div class="modal__back">
    <div class="modal__window">
      <img :src="props.user.attributes.Img" alt="" />
      <p>{{ props.user.attributes.Participant }}</p>
      <p>{{ props.user.attributes.Date }}</p>
      <p>{{ props.user.attributes.CourseTitle }}</p>
      <input-field
        label="address"
        type="text"
        v-model="form.address"
        placeholder="address"
      />
      <app-button @click="mint" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UseProvider, UserJSONResponse, UserJSONResponseList } from '@/types'
import { InputField } from '@/fields'
import { computed, reactive, ref } from 'vue'
import { useWeb3ProvidersStore } from '@/store'
import { useErc721, useProvider } from '@/composables'
import { PROVIDERS } from '@/enums'
import { ErrorHandler } from '@/helpers'
import { api } from '@/api'
import { IpfsJSONResponse } from '@/types/ipfs.types'
import AppButton from '@/common/AppButton.vue'
const form = reactive({
  address: '',
})
const props = withDefaults(
  defineProps<{
    user: UserJSONResponse
  }>(),
  {
    user: undefined,
  },
)

const web3Store = useWeb3ProvidersStore()

const providers: UseProvider[] = []

const certificateSBT = useErc721('0x0c4487b8a9dcB460C864293146D2056e2E53c680') //todo make better

const metamaskProvider = computed(() =>
  providers.find(el => el.selectedProvider.value === PROVIDERS.metamask),
)
const isLoaded = ref(false)
const isLoadFailed = ref(false)

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
const safeMint = async (recipient: string, uri: string) => {
  const res = await certificateSBT.safeMint(recipient, uri)
  console.log(res)
}

const mint = async () => {
  let url = ''
  const resp = await api
    .post<IpfsJSONResponse>('/integrations/ccp/ipfs/', {
      data: {
        Description: 'test',
        Img: props.user.attributes.CertificateImg,
        Name: props.user.attributes.Participant,
      },
    })
    .then(resp => (url = resp.data.attributes.url))
    .catch(
      err => console.log('error: ', err), //todo make better
    )
  await init()
  console.log(url)
  const safeMintResp = await safeMint(form.address, 'https://ipfs.io/ipfs/' + url)
  console.log(safeMintResp)
}
</script>

<style scoped>
.modal__window{
  width: 50%;
  height: 70%;
  background: white;
  border-radius: 10px;
  flex-direction: row;
  padding: 10px;
  position: fixed;
}

.modal__back{
  /*display: none;*/
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

}
</style>
