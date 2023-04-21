<template>
  <div class="setting">
    <app-header />
    <div class="setting_body">
      <div class="setting__info">
        <h1 class="setting__title" >{{ pageName }}</h1>
        <p>
          {{ title }}
        </p>
      </div>
      <h1 class="settings__fields-title">  {{ generalSettingsTitle }}</h1>
      <input-field
        class="settings__form"
        label="Name of organization"
        type="text"
        v-model="form.Org"
        placeholder="DL"
      />
      <input-field
        label="Account name"
        class="settings__form"
        type="text"
        v-model="form.Name"
        placeholder="Account name"
      />
      <h1 class="settings__fields-title">{{ signKeyTitle }}</h1>
      <input-field
        label="Bitcoin Timestamping Mnemonic Phrase"
        class="settings__form"
        type="text"
        v-model="form.SendKey"
        placeholder="Send key"
      />
      <input-field
        label="Google Sheet URL"
        class="settings__form"

        type="text"
        v-model="form.Url"
        placeholder="Url"
      />
      <input-field
        label="Bitcoin Corporate Signing Key (WIF)"
        class="settings__form"

        type="text"
        v-model="form.SignKey"
        placeholder="SignKey"
      />
      <div class="settings__btns">
        <app-button class="settings_btn" text="Save" @click="save" />
        <app-button class="settings_btn" text="Cancel" @click="cancel" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
import {reactive, ref} from 'vue'
import {UserJSONResponseList, UserSetting} from '@/types'
import { useUsersModules } from '@/store/modules/use-users.modules'
import { useRouter } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import AppButton from '@/common/AppButton.vue'
import AppHeader from '@/common/AppHeader.vue'
import btc from '@/utils/bitcoin.util'

import {api} from "@/api";


const userState = useUsersModules()
const title =
  'Ac integer sapien nisl turpis arcu integer. Pellentesque phasellus egestas\n' +
  '      pharetra quam cursus'
const generalSettingsTitle = 'General settings'
const signKeyTitle = 'Key settings for signatures'
const pageName = 'Setting'
const form = reactive({
  Name: '',
  Org: '',
  SignKey: '',
  SendKey: '',
  Url: '',
} as UserSetting)

const router = useRouter()

const save = async () => {
  userState.setting = form
  const address = btc.Bitcoin.getAddressFromWIF(form.SignKey)

  console.log("address", address)
  userState.setting.Address = address || ''

  await api
    .post<UserJSONResponseList>('/integrations/ccp/users/settings', {
      data: {
        code: "",
        name: userState.setting.Name,
      },
    })
    .then(async resp => {
      console.log(resp)
      await router.push(ROUTE_NAMES.main)
    })

}


const cancel = ()=>{
   router.push(ROUTE_NAMES.certificates)
}
</script>
<style scoped lang="scss">
$title: #ff545b;

.setting_body{
  display: grid;
  justify-items: center;
}

.setting__info {
  display: grid;
  justify-items: center;
  max-height: toRem(100);
  margin-bottom: toRem(50);
  color: $title;
}
.settings__form {
  margin-bottom: toRem(50);
  width: toRem(458);
}

.settings__btns{
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRem(80);
}

.settings__fields-title{
  margin-bottom: toRem(30);
}

.setting__title{
  margin-bottom: toRem(20);
}

.settings_btn{
  background: #0066FF;
  width: toRem(150);
}
</style>
