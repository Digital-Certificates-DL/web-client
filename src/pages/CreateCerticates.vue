<template>
  <app-header />
  <div class="create_title">
    <h1>
      Create new certificate
    </h1>
  </div>
  <div class="create_body">
    <div class="create_first-step">
      <p class="step-1">1</p>
      <div class="create_collection-name">
        <h1>
          Write a name for your certificate
        </h1>
        <input-field
          label="Name"
          type="text"
          v-model="certificatesInfo.Name"
          placeholder="note position(y)"
        />
      </div>
    </div>

    <div class="create_second_step">
      <p class="step-2">
        2
      </p>
      <div class="create_upload_files">
        <input-field id="image-file" type="file" label="template" v-model="certificatesInfo.Template"/>
        <!--todo  make better ^-->
      </div>
    </div>
    <div class="create_third_step">
      <p class="step-3">
        3
      </p>
      <div class="create_upload_files">
        <input-field
          label="Name"
          type="text"
          v-model="certificatesInfo.Link"
          placeholder="note position(y)"
        />
      </div>
      <div class="create_btns">
        <app-button
          class="complex-form__submit-btn"
          type="submit"
          text="Start"
          @click="start"
        />
        <app-button
          class="complex-form__cancel-btn"
          type="submit"
          text="Cancel"
          @click="start"
        />
      </div>
    </div>

    <div v-if="loaderState.state" class="create__loader">
      <div class="create__loader-body">
        <h1>Progress</h1>
        <p>{{ loaderState.body }}</p>
        <div v-if="loaderState.finished">
          <app-button
            class="complex-form__cancel-btn"
            type="submit"
            text="Watch All"
            @click="watchAll"
          />
        </div>
      </div>
    </div>
  </div>
<!--  <div id="app">-->
<!--    <input-field-->
<!--      label="SendKey"-->
<!--      type="text"-->
<!--      v-model="form.SendKey"-->
<!--      placeholder="note position(y)"-->
<!--    />-->
<!--    <input-field-->
<!--      label="SignKey"-->
<!--      type="text"-->
<!--      v-model="form.SignKey"-->
<!--      placeholder="note position(y)"-->
<!--    />-->
<!--    <input-field-->
<!--      label="Url"-->
<!--      type="text"-->
<!--      v-model="form.Url"-->
<!--      placeholder="note position(y)"-->
<!--    />-->
<!--  </div>-->
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import InputField from '@/fields/InputField.vue'
import { api } from '@/api'
import { AppButton } from '@/common'
import { Signature } from '@/utils/signature.utils'
import { UserJSONResponseList, UserSetting } from '@/types/user.types'
import { useUsersModules } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import AppHeader from "@/common/AppHeader.vue";

const userSetting = useUsersModules()

const form = reactive({
  Url: '',
  SignKey: '',
  SendKey: '',
} as UserSetting)

const certificatesInfo = reactive({
  Name: '',
  Template: null,
  Link: '',
  Table: null
})

let loaderState = {
  state: false,
  finished: false,
  body: ''
}
const start = async () => {
  // todo add loader
  loaderState.state = true
  loaderState.body = 'Parsing users'
  const users = await parsedData(form.Url)
  loaderState.body = 'Signing users'
  const signatures = sign(users.data)
  loaderState.body = 'Creating PDF for users'
  await createPDF(signatures)
  loaderState.body = ''
  loaderState.state = false
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
    if (user.attributes.Signature === undefined) {
      user.attributes.Signature = signature.signMsg(user.attributes.Msg)
    }
  }
  return users
}

const prepareUserImg = (users: UserJSONResponseList) => {
  console.log(users)
  for (const user of users.data) {
    console.log(user)
    user.attributes.Img =
      'data:image/png;base64,' + user.attributes.CertificateImg.toString()
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
    .then(resp => {
      const users = prepareUserImg(resp.data)
      userSetting.students = users.data
    })

}

const cancel = async () => {
  await router.push(ROUTE_NAMES.main)
}

const watchAll = async  () => {
  await router.push(ROUTE_NAMES.certificates)
}

</script>

<style lang="scss">


.complex-form__cancel-btn{
  background: #EEEEEE;
  border-radius: toRem(10);
  font-size: toRem(14);
}

.complex-form__submit-btn{
  background: #0066FF;
  border-radius: toRem(10);
  font-size: toRem(14);

}

.step-1{
  background: #EEEEEE;
  border-radius: toRem(10);
  font-size: toRem(14);
}

.step-1--ready{
  background: #0066FF;
}

</style>
