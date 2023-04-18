<template>
  <div v-if="isLoader">
    <loader :title="loaderState.body" scheme="spinner"  class="create_loader"/>
  </div>
  <div v-else-if="isUnauthorized">
    <auth-modal @close-modal="closeModal" @with-code="updateCode"/>
  </div>
  <dic v-else class="certificate">
    <app-header />

    <div class="create_title">
      <h1>Create new certificate</h1>
    </div>
    <div class="create_body">
      <div class="create_first-step">

        <p class="step-1">1</p>

        <div class="create_collection-name">
          <h1>Write a name for your certificate</h1>
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
          <input-field
            id="image-file"
            type="file"
            label="template"
            v-model="certificatesInfo.Template"
          />
          <!--todo  make better ^-->
        </div>
      </div>
      <div class="create_third_step">
        <p class="step-3">
          3
        </p>
        <div class="create_upload_files">
          <input-field
            label="Link"
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

            <app-button
              class="complex-form__cancel-btn"
              type="submit"
              text="Cancel"
              @click="cancel"
            />
          </div>
        </div>
      </div>
    </div>
  </dic>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
import InputField from '@/fields/InputField.vue'
import { api } from '@/api'
import { AppButton } from '@/common'
import { Signature } from '@/utils/signature.utils'
import { UserJSONResponseList, UserSetting } from '@/types/user.types'
import { useUsersModules } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import AppHeader from '@/common/AppHeader.vue'
import Loader from "@/common/Loader.vue";
import {defer, lowerFirst} from "lodash-es";
import AuthModal from "@/common/AuthModal.vue";
const userSetting = useUsersModules()

const isLoader = ref(false)
const isUnauthorized = ref(false)

const form = reactive({
  Url: '',
  SignKey: '',
  SendKey: '',
} as UserSetting)

const certificatesInfo = reactive({
  Name: '',
  Template: null,
  Link: '',
  Table: null,
})

const loaderState = {
  state: false,
  finished: false,
  body: '',
}
const start = async () => {
  loaderState.state = true
  defer(closeLoader)
  isLoader.value = loaderState.state
  loaderState.body = 'Parsing users'
  console.log('Parsing users')
  const users = await parsedData(certificatesInfo.Link)
  loaderState.body = 'Signing users'
  console.log('Signing users')
  const signatures = sign(users.data)
  loaderState.body = 'Creating PDF for users'
  await createPDF(signatures)
  console.log('Creating PDF for users')
  loaderState.body = ''
  loaderState.state = false
}
const parsedData = async (sheepUrl?: string) => {
  const users = await api.post<UserJSONResponseList>(
    '/integrations/ccp/users/empty',
    {
      data: {
        url: sheepUrl || userSetting.setting.Url,
      },
    },
  )

  if (users.status === 403){
      isUnauthorized.value = false
  }

  console.log('users: ', users)
  return users
}
const sign = (users: UserJSONResponseList) => {
  console.log('start sign: ', users)
  const signature = new Signature(form.SignKey || userSetting.setting.SignKey)
  for (const user of users.data) {
    console.log('user: ', user)
    if (
      user.attributes.Signature === undefined ||
      user.attributes.Signature == ''
    ) {
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
    .post<UserJSONResponseList>('/integrations/ccp/certificate/', {
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
      router.push(ROUTE_NAMES.certificates)
    })
}

const closeLoader = () => {
  console.log("close loader")
  isLoader.value = false
}
const cancel = async () => {
  await router.push(ROUTE_NAMES.main)
}

const watchAll = () => {
  router.push(ROUTE_NAMES.certificates)
}

const closeModal = ()=>{
  isUnauthorized.value = false
}

const updateCode = async (code: string) =>{

  await api
    .post<UserJSONResponseList>('/integrations/ccp/users/settings', {
      data: {
        code: code,
        name: userSetting.setting.Name,
      },
    })
    .then(resp => {
      console.log(resp)
      isUnauthorized.value = false
    })
}

</script>

<style lang="scss">
.complex-form__cancel-btn {
  background: #eeeeee;
  border-radius: toRem(10);
  font-size: toRem(14);
}

.complex-form__submit-btn {
  background: #0066ff;
  border-radius: toRem(10);
  font-size: toRem(14);
}

.step-1 {
  background: #eeeeee;
  border-radius: toRem(10);
  font-size: toRem(14);
}

.step-1--ready {
  background: #0066ff;
}

.create_loader{
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
</style>
