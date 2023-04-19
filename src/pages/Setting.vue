<template>
  <div class="setting">
    <app-header />
    <div class="setting__title">
      <h1>{{ pageName }}</h1>
      <p>
        {{ title }}
      </p>
    </div>
    <div class="setting_body">
      <p>{{ generalSettingsTitle }}</p>
      <input-field
        label="Name of organization"
        type="text"
        v-model="form.Org"
        placeholder="DL"
      />
      <input-field
        label="Account name"
        type="text"
        v-model="form.Name"
        placeholder="Account name"
      />
      <h1>{{ signKeyTitle }}</h1>
      <input-field
        label="Bitcoin key"
        type="text"
        v-model="form.SendKey"
        placeholder="Send key"
      />
      <input-field
        label="Url"
        type="text"
        v-model="form.Url"
        placeholder="Url"
      />
      <input-field
        label="SignKey"
        type="text"
        v-model="form.SignKey"
        placeholder="SignKey"
      />
      <app-button text="Save" @click="save" />
      <app-button text="Cancel" @click="cancel" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
import { reactive } from 'vue'
import {UserJSONResponseList, UserSetting} from '@/types'
import { useUsersModules } from '@/store/modules/use-users.modules'
import { useRouter } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import AppButton from '@/common/AppButton.vue'
import AppHeader from '@/common/AppHeader.vue'
import btc from '@/utils/bitcoin.util'
import { testnet } from 'ecpair/src/networks'
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
  console.log(address)
  userState.setting.Address = address || ''



  await api
    .post<UserJSONResponseList>('/integrations/ccp/users/settings', {
      data: {
        code: "",
        name: userState.setting.Name,
      },
    })
    .then(resp => {
      console.log(resp)
      router.push(ROUTE_NAMES.main)
    })
}

const cancel = async()=>{
  await router.push(ROUTE_NAMES.main)
}
</script>
<style scoped lang="scss">
$title: #ff545b;

.setting__title {
  max-height: toRem(100);
  margin-bottom: toRem(0);
  color: $title;
}
.input-field {
  margin-bottom: toRem(50);
}
</style>
