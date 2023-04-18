<template>
  <div class="modal__back">
    <div class="modal__window">
      <div class="modal__img">
        <img  :src="props.user.attributes.Img" alt="" />
      </div>
      <h1 class="modal__title">SBT issuance</h1>
      <div class="modal__name">
        <label for="participant">Full name</label>
        <p id="participant">{{ props.user.attributes.Participant }}</p>
      </div>
      <p>{{ props.user.attributes.Date }}</p>
      <p>{{ props.user.attributes.CourseTitle }}</p>
      <input-field
        label="address"
        type="text"
        v-model="form.address"
        placeholder="address"
      />
      <div class="modal__btns">
        <app-button text="mint" @click="mint" />
        <app-button text="cancel" @click="cancel" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UseProvider, UserJSONResponse } from '@/types'
import { InputField } from '@/fields'
import { reactive, ref } from 'vue'
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

// const metamaskProvider = computed(() =>
//   providers.find(el => el.selectedProvider.value === PROVIDERS.metamask),
// )
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
  await certificateSBT.safeMint(recipient, uri)
}

const mint = async () => {
  let url = ''
  await api
    .post<IpfsJSONResponse>('/integrations/ccp/ipfs/', {
      data: {
        Description: 'test',
        Img: props.user.attributes.CertificateImg,
        Name: props.user.attributes.Participant,
      },
    })
    .then(resp => (url = resp.data.attributes.url))
    .catch
    // err => console.log('error: ', err), //todo make better
    ()
  await init()
  await safeMint(form.address,  url)
}

const emit = defineEmits<{
  (e: 'cancel', state: boolean): boolean
}>()

const cancel = ()=>{
  console.log("cancel")
  emit("cancel",  false)
}
</script>

<style  scoped lang="scss" >
.modal__window {
  width: 30%;
  height: 70%;
  background: white;
  border-radius: 1rem;
  flex-direction: row;
  padding: toRem(24);
  position: fixed;
  display: grid;

}

.modal__back {
  backdrop-filter: blur(1rem);
  background: #00000080;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__img {
  display: flex;
  justify-content: center;
}

img{
  width: 100%;
}

.modal__title{
  padding-top: toRem(30);
  padding-bottom: toRem(30);
  margin: auto;
}

.modal__btns{
  display: flex;
  justify-content: space-between;
}

</style>
