<template>
  <div id="app">
    <input-field
      label="form.field1"
      type="text"
      v-model="form.SendPrivateKey"
      placeholder="note position(y)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.SignPrivateKey"
      placeholder="note position(y)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Url"
      placeholder="note position(y)"
    />
    <app-button
      class="complex-form__submit-btn"
      type="submit"
      text="Submit"
      @click="start"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import InputField from '@/fields/InputField.vue'
import { api } from '@/api'
import { AppButton } from '@/common'
import { Signature } from '@/utils/signature.utils'
import { UserJSONResponseList } from '@/types/user.types'

const form = reactive({
  Url: '',
  SignPrivateKey: '',
  SendPrivateKey: '',
})

const start = async () => {
  const users = await parsedData(form.Url)
  const signatures = sign(users.data)
  await createPDF(signatures)
}
const parsedData = async (sheep: string) => {
  const users = await api.post<UserJSONResponseList>('/integrations/ccp/', {
    data: {
      url: sheep,
    },
  })
  return users
}
const sign = (users: UserJSONResponseList) => {
  const signature = new Signature(form.SignPrivateKey)
  for (const user of users.data) {
    user.attributes.Signature = signature.signMsg(user.attributes.Msg)
  }
  return users
}

const createPDF = async (users: UserJSONResponseList) => {
  const resp = await api.post<UserJSONResponseList>('/integrations/ccp/pdf', {
    data: {
      url: users,
    },
  })
  resp.data //todo  add new header checker
}
</script>

<style></style>
