<template>
  <div v-if="isLoader">
    <loader  scheme="spinner" class="create_loader" />
  </div>
  <div v-else-if="isUnauthorized">
    <auth-modal :token-link="authLink" @close-modal="closeModal" @with-code="updateCode" />
  </div>
  <dic v-else class="generation">
    <app-header />

    <div class="create_title">
      <h1>Create new certificate</h1>
    </div>
    <div class="generation__body">
      <div class="create__step">
        <p class="create__step-number">1</p>

        <div class="create_collection-name">
          <h1>Write a name for your certificate</h1>
          <input-field
            class="generation__text-input"
            label="Name"
            type="text"
            v-model="certificatesInfo.Name"
            placeholder="note position(y)"
          />
        </div>
      </div>

      <div class="create__step">
        <p class="create__step-number">
          2
        </p>
        <div class="create_upload_files">
          <h1>Choose or upload template for a new certificate</h1>
          <input-field
            class="generation__file-input"
            id="image-file"
            type="file"
            label="template"
            v-model="certificatesInfo.Template"
          />
          <!--todo  make better ^-->
        </div>
      </div>
      <div class="create__step">
        <p class="create__step-number">
          3
        </p>
        <div class="create_upload_files">
          <h1>Choose or upload template for a new certificate</h1>
          <input-field
            class="generation__text-input"
            label="Link"
            type="text"
            v-model="certificatesInfo.Link"
            placeholder="note position(y)"
          />
        </div>
      </div>
      <div class="create__btns">
        <app-button
          class="complex-form__submit-btn"
          type="submit"
          text="Start"
          @click="start"
        />
        <app-button
          class="complex-form__submit-btn"
          type="submit"
          text="cancel"
          @click="cancel"
        />
      </div>
    </div>
  </dic>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import InputField from '@/fields/InputField.vue'
import { api } from '@/api'
import { AppButton } from '@/common'
import { Signature } from '@/utils/signature.utils'
import {UnauthorizedResponse, UserJSONResponseList, UserJSONResponse, UserSetting} from '@/types/user.types'
import { useUsersModules } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import AppHeader from '@/common/AppHeader.vue'
import Loader from '@/common/Loader.vue'
import { defer, lowerFirst } from 'lodash-es'
import AuthModal from '@/common/AuthModal.vue'
const userSetting = useUsersModules()

const isLoader = ref(false)
const isUnauthorized = ref(false)
const authLink = ref("")
const loaderState = ref("")

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

// const loaderState = {
//   state: false,
//   finished: false,
//   body: '',
// }


const start = async () => {
  defer(() => {
    console.log('close loader')
    isLoader.value = false
  })
  isLoader.value = true
  loaderState.value = 'Parsing users'
  console.log('Parsing users')
  const users = await parsedData(certificatesInfo.Link)
  if (users===undefined){
    return
  }
  loaderState.value = 'Signing users'
  console.log('Signing users')
  const signatures = sign(users)
  console.log(" signatures ",signatures)
  loaderState.value = 'Creating PDF for users'
  await createPDF(signatures)
  loaderState.value = ''
  isLoader.value = false
}
const parsedData = async (sheepUrl?: string) => {
  const resp = await api.post< UserJSONResponseList | UnauthorizedResponse >(
    '/integrations/ccp/users/empty',
    {
      data: {
        name: userSetting.setting.Name,
        url: sheepUrl || userSetting.setting.Url,
      },
    },
  ).then(
    resp => {
      console.log("resp: ", resp)
      if (resp.status === 403){
        console.log(403," in resp")
        return
      }
      return resp
    }
  ).catch(err => {
    console.log(err)
    console.log("link", err.response.data.data.attributes.link)
    if (err.response.data.data.attributes.link){
      console.log(403," in error")
      isUnauthorized.value = true
      authLink.value = err.response.data.data.attributes.link
    }
  })
  console.log('users: ', resp)
  if (!resp){
    console.log("undefined")
    return
  }
  return resp as UserJSONResponseList | {} as UserJSONResponseList
}
const sign = (users: UserJSONResponseList) => {
  console.log('start sign: ', users.data.data)
  const signature = new Signature(form.SignKey || userSetting.setting.SignKey)
  for (const user of users.data.data) {
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
  console.log(users.data)
  const list: UserJSONResponse[]= users.data
  for (const user of  list) {
    console.log(user)
    user.attributes.Img =
      'data:image/png;base64,' + user.attributes.CertificateImg.toString()
  }

  return users
}
const createPDF = async (users: UserJSONResponseList) => {
  console.log("create pdf:  ",  users)
  await api
    .post<UserJSONResponseList>('/integrations/ccp/certificate/', {
      data: {
        data: users.data.data, //todo make better
        address:
          userSetting.setting.Address || '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW',
        url: userSetting.setting.Url || form.Url,
        name: userSetting.setting.Name

      },
    })
    .then(resp => {
      const users = prepareUserImg(resp.data)
      userSetting.students = users.data
      router.push(ROUTE_NAMES.certificates)
    })
}


const cancel = async () => {
  await router.push(ROUTE_NAMES.main)
}

const watchAll = () => {
  router.push(ROUTE_NAMES.certificates)
}

const closeModal = () => {
  isUnauthorized.value = false
}

const updateCode = async (code: string) => {
  isUnauthorized.value = false
  console.log("code: ", code)
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

<style  lang="scss" >


.create__step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eeeeee;
  border-radius: toRem(30);
  font-size: toRem(14);
  width: toRem(30);
  height: toRem(30);
}

.create__step-number--ready {
  background: #0066ff;
}

.create_loader {
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

.generation__text-input{
  display: block;
  width: toRem(458);
  margin-bottom: toRem(20);
  margin-top: toRem(20);
}

.generation__file-input{
  margin-bottom: toRem(20);
  margin-top: toRem(20);
  width: toRem(314);
  height: toRem(222);
}

.create__step{
  display: flex;
margin-top: toRem(20);
}

.create__btns{
  display: flex;
  justify-content: space-between;
  width: toRem(350);
  margin-left: toRem(80);
}

.create__btn{
  width: toRem(100);
  background: #0066ff;
}

</style>
