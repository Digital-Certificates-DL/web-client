<template>
  <div class="timestamp">
    <h2>{{ certificatesTitle }}</h2>
    <div class="certificates__search">
      <input-field
        class="timestamp__search-input"
        placeholder="find"
        v-model="form.search"
        @update:model-value="find"
      />
      <div class="timestamp__btns">
        <!--        <div v-if="timestampCount > 0" class="certificates__btns">-->
        <!--          <p>{{ timestampCount }}</p>-->

        <!--          &lt;!&ndash;          <app-button class="timestamp__btn" @click="find" text="Find" />&ndash;&gt;-->

        <!--          <app-button-->
        <!--            class="timestamp__btn"-->
        <!--            @click="bitcoinTimestamp"-->
        <!--            :color="'success'"-->
        <!--            text="Bitcoin"-->
        <!--          />-->
        <!--        </div>-->
      </div>
      <!--      <div v-if="isModalActive">-->
      <!--        <certificate-modal-->
      <!--          :user="currentUser"-->
      <!--          v-model:is-shown="isModalActive"-->
      <!--        />-->
      <!--      </div>-->

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
          <!--          <img-->
          <!--            class="timestamp__img"-->
          <!--            src="static/branding/template.jpg"-->
          <!--            alt="Certificate preview"-->
          <!--          />-->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/use-users.modules'
import { UserJSONResponse, UserJSONResponseList } from '@/types'
// import AppButton from '@/common/AppButton.vue'
import { api } from '@/api'
import InputField from '@/fields/InputField.vue'
import { reactive, ref } from 'vue'
import { Bitcoin } from '@/utils/bitcoin.util'

const userState = useUserStore()

// const currentUser = ref({} as UserJSONResponse)

const timestampCount = ref(0)

const certificatesTitle = 'Previously certificates'
const listForTimestamp = ref([] as UserJSONResponse[])
const isModalActive = ref(false)

const form = reactive({
  search: '',
})

const userList = ref([] as UserJSONResponse[])

let userBuffer
const find = () => {
  userBuffer = userState.students

  if (form.search === '' && userBuffer !== undefined) {
    userState.students = userBuffer
  }
  userState.students.filter(item => item.participant.includes(form.search))
}

const prepareUserImg = (users: UserJSONResponseList) => {
  const list: UserJSONResponse[] = users.data
  for (const user of list) {
    user.img = 'data:image/png;base64,' + user.certificateImg.toString()
  }

  return users.data
}

const bitcoinTimestamp = async () => {
  const bitcoin = new Bitcoin()

  const UTXOs = await bitcoin.getUTXOBip32TestnetBlockstream(
    userState.setting.sendMnemonicPhrase,
  )

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
      continue
    }
    const { data } = await bitcoin.SendToTestnet(hex)

    user.txHash = data.tx.hash.toString()

    bitcoin.setNewUTXO(exAddress, exPath, data.tx.hash, balance)
  }
  const users = await updateUsers(listForTimestamp.value)
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
