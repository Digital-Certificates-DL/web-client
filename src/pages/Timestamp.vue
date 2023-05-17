<template>
  <div class="timestamp">
    <h2>{{ certificatesTitle }}</h2>
    <div class="certificates__search">
      <input-field
        class="timestamp__search-input"
        placeholder="find"
        v-model="form.search"
        @update:model-value="search"
      />
      <div class="timestamp__btns">
        <div v-if="timestampCount > 0" class="certificates__btns">
          <p>{{ timestampCount }}</p>

          <!--          <app-button class="timestamp__btn" @click="find" text="Find" />-->

          <app-button
            class="timestamp__btn"
            @click="bitcoinTimestamp"
            :color="'success'"
            text="Bitcoin"
          />
        </div>
      </div>
      <div v-if="isModalActive">
        <modal-info @cancel="closeModal" :user="currentUser"></modal-info>
      </div>

      <div class="timestamp__body">
        <div class="timestamp__list">
          <!--          <div v-if="userState.students.length === 0">-->
          <!--            <error-message message="Empty certificate list" />-->
          <!--          </div>-->
          <!--          <div v-for="(item, key) in userList" :value="key" :key="item">-->
          <!--            <timestemp-item-->
          <!--              :name="item.participant"-->
          <!--              :date="item.date"-->
          <!--              :user="item"-->
          <!--              @select="selectItem"-->
          <!--              @open-modal="openModal"-->
          <!--            />-->
          <!--          </div>-->
        </div>

        <div class="timestamp__img-wrp">
          <img
            class="timestamp__img"
            src="static/branding/template.jpg"
            alt="Certificate preview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
import ErrorMessage from '@/common/ErrorMessage.vue'
import AppButton from '@/common/AppButton.vue'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import btc, { Bitcoin } from '@/utils/bitcoin.util'

import TimestempItem from '@/common/TimestempItem.vue'
import AppNavbar from '@/common/AppNavbar.vue'
import { timestamp } from '@vueuse/core'
import ModalInfo from '@/common/modals/CertificateModal.vue'
const userState = useUserStore()

const currentUser = ref({} as UserJSONResponse)
const isModalActive = ref(false)

const timestampCount = ref(0)

const certificatesTitle = 'Previously certificates'
const listForTimestamp = ref([] as UserJSONResponse[])

const form = reactive({
  search: '',
})

const userList = ref([] as UserJSONResponse[])

let userBuffer
const search = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item => item.participant.includes(form.search))
}

const openModal = (state: boolean, user: UserJSONResponse) => {
  isModalActive.value = state
  currentUser.value = user
}
const prepareUserImg = (users: UserJSONResponseList) => {
  const list: UserJSONResponse[] = users.data
  for (const user of list) {
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users.data
}

const closeModal = () => {
  isModalActive.value = false
}
const bitcoinTimestamp = async () => {
  const bitcoin = new Bitcoin()

  const UTXOs = await bitcoin.getUTXOBip32TestnetBlockstream(
    userState.setting.sendMnemonicPhrase,
  )

  console.log(UTXOs)
  console.log('start prepare ')
  console.log('listForTimestamp ', listForTimestamp)
  for (const user of listForTimestamp.value) {
    const tx = await bitcoin.PrepareLegacyTXTestnet(
      userState.setting.sendMnemonicPhrase,
    )
    console.log('tx: ', tx)
    const hex = tx?.hex || ''
    const exAddress = tx?.exAddress || ''
    const exPath = tx?.exPath || ''
    const balance = tx?.balance || -1
    if (hex === '' || exAddress === '' || exPath === '' || balance === -1) {
      return
    }
    console.log('tx: ', tx)
    if (tx === undefined) {
      console.log('continue')
      continue
    }
    const { data } = await bitcoin.SendToTestnet(hex)
    console.log('data ', data)
    console.log('data tx ', data.tx)
    console.log('data tx hash ', data.tx.hash)
    console.log('user ', user)
    user.txHash = data.tx.hash.toString()

    console.log('resp: ', data)
    bitcoin.setNewUTXO(exAddress, exPath, data.tx.hash, balance)
    console.log('set: ', bitcoin.addressInfoList)
  }
  const users = await updateUsers(listForTimestamp.value)
  console.log(users, ' updated ')
  userList.value = users
}

const updateUsers = async (users: UserJSONResponse[]) => {
  //todo check it

  console.log('users update: ', users)
  const usersResp = await api.post<UserJSONResponseList>(
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

  return prepareUserImg(usersResp.data)
}

const autoRefresh = () => {
  console.log('start')

  userList.value = userState.students
  console.log('auto: ', userList.value)
  userList.value = userState.students
}

const selectItem = (state: boolean, item: UserJSONResponse) => {
  console.log(item)
  if (state) {
    listForTimestamp.value.push(item)
    console.log(listForTimestamp, 'list')
    timestampCount.value = listForTimestamp.value.length
    return
  }

  const index = listForTimestamp.value.indexOf(item, 0)
  if (index > -1) {
    listForTimestamp.value.splice(index, 1)
  }
  timestampCount.value = listForTimestamp.value.length
}

autoRefresh()

// const selectForTimestamp = (state: boolean, user: UserJSONResponse) => {
//   if (state) {
//     listForCreate.push(user)
//     return
//   }
//
//   listForCreate.filter(item => item !== user)
// }
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
  width: toRem(426);
}
</style>
