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
            :model-value="findInputData"
            @update:model-value="Search"
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
          :user="currentUser"
          v-model:is-shown="isModalActive"
        />
      </div>

      <div class="timestamp__body">
        <div class="timestamp__list">
          <div v-if="userList.length === 0">
            <error-message message="Empty certificate list" />
          </div>
          <div v-for="item in userList" :value="item" :key="item.id">
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
            :src="currentUser.img || 'static/branding/template.jpg'"
            alt="Certificate preview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { UserJSONResponse } from '@/types'
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
import { ErrorHandler } from '@/helpers'

const isModalActive = ref(false)
const currentUser = ref({} as UserJSONResponse)
const selectedCount = ref(0)

const userState = useUserStore()

const findInputData = ref('')
const isShowTimestampCheckbox = ref(false)
const processState = ref('')
const isLoading = ref(false)

const userList = ref([] as UserJSONResponse[])
const selectedItems = ref([] as UserJSONResponse[])

const prepareUserImg = (users: UserJSONResponse[]) => {
  for (const user of users) {
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
}

const Search = () => {
  findInputData.value = ''
}

const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser.value = user
}
const bitcoinTimestamp = async () => {
  try {
    const bitcoin = new Bitcoin()
    isLoading.value = true

    /* eslint-disable no-console */
    console.log('bitcoinTimestamp')

    processState.value = 'Getting UTXO'
    await bitcoin.getUTXOBip32TestnetBlockstream(
      userState.setting.bip39MnemonicPhrase,
    )
    processState.value = 'Prepare transaction'

    for (const user of selectedItems.value) {
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

      user.txHash = data.tx.hash.toString()

      bitcoin.setNewUTXO(exAddress, exPath, data.tx.hash, balance)
    }

    userList.value = await updateUsers(selectedItems.value)
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    ErrorHandler.process(error)
  }
}

const updateUsers = async (users: UserJSONResponse[]) => {
  try {
    const { data } = await api.post<UserJSONResponse[]>(
      '/integrations/ccp/certificate/bitcoin',
      {
        body: {
          data: {
            users: users,
            address: userState.setting.userBitcoinAddress,
            name: userState.setting.accountName,
            url: userState.setting.urlGoogleSheet,
          },
        },
      },
    )
    return prepareUserImg(data)
  } catch (err) {
    ErrorHandler.process(err)
  }
}

const autoRefresh = () => {
  userList.value = userState.bufferUserList
}
const selectItem = (state: boolean, item: UserJSONResponse) => {
  if (state) {
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
