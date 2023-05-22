<template>
  <div class="timestamp">
    <h2>{{ $t('timestamp.page-title') }}</h2>
    <div class="certificates__search">
      <input-field class="timestamp__search-input" placeholder="find" />

      <div class="timestamp__btns">
        <div v-if="selectedCount > 0" class="certificates__btns">
          <p>{{ selectedCount }}</p>

          <app-button
            class="timestamp__btn"
            @click="bitcoinTimestamp"
            :color="'success'"
            text="Bitcoin"
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
          <div v-for="(item, key) in userList" :value="key" :key="item">
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
const isModalActive = ref(false)
const currentUser = ref({} as UserJSONResponse)
const selectedCount = ref(0)

const userState = useUserStore()
// const timestampCount = ref(0)
const isShowTimestampCheckbox = ref(false)

const userList = ref([] as UserJSONResponse[])
const selectedItems = ref([] as UserJSONResponse[])

const prepareUserImg = (users: UserJSONResponse[]) => {
  for (const user of users) {
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users
}

const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser.value = user
}
const bitcoinTimestamp = async () => {
  const bitcoin = new Bitcoin()

  await bitcoin.getUTXOBip32TestnetBlockstream(
    userState.setting.sendMnemonicPhrase,
  )

  for (const user of selectedItems.value) {
    const tx = await bitcoin.PrepareLegacyTXTestnet(
      userState.setting.sendMnemonicPhrase,
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
}

const updateUsers = async (users: UserJSONResponse[]) => {
  const { data } = await api.post<UserJSONResponse[]>(
    '/integrations/ccp/certificate/bitcoin',
    {
      body: {
        data: {
          users: users,
          address: userState.setting.address,
          name: userState.setting.name,
          url: userState.setting.url,
        },
      },
    },
  )

  return prepareUserImg(data)
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
}

.timestamp__img-wrp {
  max-width: 40%;
}

.timestamp__img {
  width: 100%;
}

.timestamp__list {
  width: 60%;
}

.timestamp__body {
  margin-top: toRem(20);
  display: flex;
}

.timestamp__search-input {
  padding-top: toRem(20);
  width: 40%;
}
</style>
