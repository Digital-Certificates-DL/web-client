<template>
  <loader-modal v-model:is-shown="isLoading" v-model:state="processState" />

  <div class="timestamp">
    <h2>{{ $t('timestamp-page.page-title') }}</h2>
    <div class="timestamp-page__body">
      <div class="timestamp__search">
        <div class="timestamp__search-input-wrp">
          <input-field
            class="timestamp__search-input"
            :placeholder="$t('timestamp-page.input-placeholder')"
            v-model="searchData"
            @update:model-value="search"
          />
        </div>

        <div v-if="selectedCount > 0" class="timestamp__btns">
          <p>{{ selectedCount }}</p>

          <app-button
            class="timestamp__btn"
            color="info"
            :text="$t('timestamp-page.bitcoin-btn')"
            @click="bitcoinTimestamp"
          />
        </div>
      </div>

      <div v-if="isModalActive">
        <certificate-modal
          :certificate="currentCertificate"
          v-model:is-shown="isModalActive"
        />
      </div>

      <div class="timestamp__body">
        <div class="timestamp__list">
          <div v-if="certificatesListBuffer.length === 0">
            <error-message message="Empty certificate list" />
          </div>
          <div v-for="item in certificatesListBuffer" :key="item.id">
            <timestamp-item
              :name="item.participant"
              :date="item.date"
              :user="item"
              :is-show="isShowTimestampCheckbox"
              @select="selectItem"
              @open-modal="openModal"
            />
          </div>
        </div>

        <div class="timestamp__img-wrp">
          <img
            class="timestamp__img"
            :src="currentCertificate.img || 'branding/template.jpg'"
            alt="Certificate preview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { CertificateJSONResponse, PottyCertificateRequest } from '@/types'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { ref } from 'vue'
import { Bitcoin } from '@/utils/bitcoin.util'
import TimestampItem from '@/common/TimestampItem.vue'
import CertificateModal from '@/common/modals/CertificateModal.vue'
import ErrorMessage from '@/common/ErrorMessage.vue'
import AppButton from '@/common/AppButton.vue'
import { tryOnBeforeMount } from '@vueuse/core'
import LoaderModal from '@/common/modals/LoaderModal.vue'
import { ErrorHandler, sleep } from '@/helpers'
import { Container } from '@/types/container.types'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/enums'

const isModalActive = ref(false)
const currentCertificate = ref({} as CertificateJSONResponse)
const selectedCount = ref(0)

const userState = useUserStore()

const searchData = ref('')
const isShowTimestampCheckbox = ref(false)
const processState = ref('')
const isLoading = ref(false)

const certificatesListBuffer = ref<CertificateJSONResponse[]>([])
const certificateList = ref<CertificateJSONResponse[]>([])
const selectedItems = ref<CertificateJSONResponse[]>([])

const prepareCertificateImg = (certificates: CertificateJSONResponse[]) => {
  for (const certificate of certificates) {
    certificate.img =
      'data:image/png;base64,' + certificate.certificateImg.toString()
  }

  return certificates
}

const openModal = (state: boolean, certificate: CertificateJSONResponse) => {
  isModalActive.value = state
  currentCertificate.value = certificate
}
const bitcoinTimestamp = async () => {
  try {
    const bitcoin = new Bitcoin()
    isLoading.value = true

    processState.value = 'Getting UTXO'
    await bitcoin.getUTXOBip32TestnetBlockstream(
      userState.setting.bip39MnemonicPhrase,
    )
    processState.value = 'Prepare transaction'

    for (const certificate of selectedItems.value) {
      /* eslint-disable no-console */
      console.log('certificate on  start : ', certificate)
      const tx = await bitcoin.PrepareLegacyTXTestnet(
        userState.setting.bip39MnemonicPhrase,
      )
      const hex = tx?.hex || ''
      const exAddress = tx?.exAddress || ''
      const exPath = tx?.exPath || ''
      const balance = tx?.balance || -1
      if (hex === '' || exAddress === '' || exPath === '' || balance === -1) {
        return
      }
      if (tx === undefined) {
        continue
      }
      const { data } = await bitcoin.SendToTestnet(hex)

      certificate.txHash = data.tx.hash.toString()

      bitcoin.setNewUTXO(exAddress, exPath, data.tx.hash, balance)
    }

    processState.value = 'Update Certificate'

    certificateList.value =
      (await updateCertificates(selectedItems.value)) || []

    certificateList.value = prepareCertificateImg(certificateList.value)
    isLoading.value = false
    await useRouter().push({ name: ROUTE_NAMES.certificates })
  } catch (error) {
    isLoading.value = false
    ErrorHandler.process(error)
  }
}

const removeImgCertificates = (certificates: CertificateJSONResponse[]) => {
  for (const certificate of certificates) {
    delete certificate.certificateImg
    certificate.img = ''
  }
  return certificates
}
const updateCertificates = async (certificates: CertificateJSONResponse[]) => {
  try {
    certificates = removeImgCertificates(certificates)
    const { data } = await api.post<Container>(
      '/integrations/ccp/certificate/bitcoin',
      {
        body: {
          data: {
            attributes: {
              certificates_data: certificates,
              address: userState.setting.userBitcoinAddress,
              name: userState.setting.accountName,
              url: userState.setting.urlGoogleSheet,
            },
          },
        },
      },
    )
    const container = await validateContainerState(data.container_id)
    return prepareCertificateImg(container!.clear_certificate)
  } catch (err) {
    ErrorHandler.process(err)
  }
}

const validateContainerState = async (containerID: string) => {
  await sleep(5000)
  const containerStatus = true
  while (containerStatus) {
    try {
      const { data } = await api.get<Container>(
        '/integrations/ccp/certificate/' + containerID,
      )
      if (!data.status) {
        await sleep(5000)
        continue
      }

      data.clear_certificate = prepareCertificate(data.certificates)

      return data
    } catch (error) {
      await sleep(5000)
    }
  }
}

const prepareCertificate = (certificates: PottyCertificateRequest[]) => {
  const certificateList = ref<CertificateJSONResponse[]>([])
  for (const certificate of certificates) {
    certificateList.value.push(certificate.attributes)
  }
  return certificateList.value
}
const autoRefresh = () => {
  certificateList.value = userState.bufferCertificateList
  certificatesListBuffer.value = certificateList.value
}

const selectItem = (state: boolean, item: CertificateJSONResponse) => {
  if (state) {
    currentCertificate.value = item
    selectedItems.value.push(item)
    selectedCount.value = selectedItems.value.length
    isShowTimestampCheckbox.value = true
    return
  }

  const index = selectedItems.value.indexOf(item, 0)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
  selectedCount.value = selectedItems.value.length
  if (selectedItems.value.length < 1) {
    isShowTimestampCheckbox.value = false
    return
  }
  isShowTimestampCheckbox.value = true
}

const search = () => {
  if (!searchData.value.length && certificatesListBuffer.value) {
    certificatesListBuffer.value = certificateList.value!
    return
  }
  const searchQuery = searchData.value.toLowerCase()
  certificatesListBuffer.value = certificatesListBuffer.value.filter(
    certificate => {
      const title = certificate.participant.toLowerCase()
      return title.includes(searchQuery)
    },
  )
}

tryOnBeforeMount(autoRefresh)
</script>

<style lang="scss" scoped>
.timestamp {
  width: var(--page-large);
  margin: 0 auto;

  @include respond-to(large) {
    width: var(--page-xmedium);
  }

  @include respond-to(xmedium) {
    width: var(--page-medium);
  }
}

.timestamp__info {
  display: flex;
  justify-content: space-between;
}

.timestamp__img {
  width: toRem(600);
  border-radius: toRem(16);

  @include respond-to(large) {
    width: toRem(500);
  }

  @include respond-to(xmedium) {
    width: toRem(400);
  }
}

.timestamp__list {
  width: 60%;
}

.timestamp__body {
  margin-top: toRem(20);
  display: flex;
}

.timestamp__search {
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: space-between;
  margin-bottom: toRem(50);
}

.timestamp__btns {
  width: toRem(200);
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
}

.timestamp__search-input {
  display: block;
  width: toRem(700);

  @include respond-to(large) {
    width: toRem(600);
  }

  @include respond-to(xmedium) {
    width: toRem(500);
  }

  @include respond-to(medium) {
    width: toRem(400);
  }
}
</style>
