<template>
  <div id="app">
    <input-field
      label="SendKey"
      type="text"
      v-model="form.SendKey"
      placeholder="note position(y)"
    />
    <input-field
      label="SignKey"
      type="text"
      v-model="form.SignKey"
      placeholder="note position(y)"
    />
    <input-field
      label="Url"
      type="text"
      v-model="form.Url"
      placeholder="note position(y)"
    />
    <app-button
      class="complex-form__submit-btn"
      type="submit"
      text="Start"
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
import { UserJSONResponseList, UserSetting } from '@/types/user.types'
import { useUsersModules } from '@/store/modules/use-users.modules'

const userSetting = useUsersModules()

const form = reactive({
  Url: '',
  SignKey: '',
  SendKey: '',
} as UserSetting)

const start = async () => {
  const users = await parsedData(form.Url)
  const signatures = sign(users.data)
  await createPDF(signatures)
}
const parsedData = async (sheepUrl?: string) => {
  const users = await api.post<UserJSONResponseList>(
    '/integrations/ccp/empty',
    {
      data: {
        url: sheepUrl || userSetting.setting.Url,
      },
    },
  )
  return users
}
const sign = (users: UserJSONResponseList) => {
  const signature = new Signature(form.SignKey || userSetting.setting.SignKey)
  for (const user of users.data) {
    user.attributes.Signature = signature.signMsg(user.attributes.Msg)
  }
  return users
}

const createPDF = async (users: UserJSONResponseList) => {
  await api
    .post<UserJSONResponseList>('/integrations/ccp/certificate', {
      data: {
        data: users.data,
        address:
          userSetting.setting.address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
        url: userSetting.setting.Url || form.Url,
      },
    })
    .then(resp => (userSetting.students = resp.data.data))
    .catch(
      err => console.log('error: ', err), //todo make better
    )
}
</script>

<style></style>
