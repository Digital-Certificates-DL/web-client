<template>
  <app-header  />
  <div class="setting__title">
    <h1>Setting</h1>
    <p>
      Ac integer sapien nisl turpis arcu integer. Pellentesque phasellus egestas pharetra quam cursus
    </p>
  </div>
  <div class="setting_body">
    <p>General settings</p>
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
    <h1>
      Key settings for signatures
    </h1>
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
    <app-button @click="save" />
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
import { reactive } from 'vue'
import { UserSetting } from '@/types'
import { useUsersModules } from '@/store/modules/use-users.modules'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import AppButton from '@/common/AppButton.vue'
import AppHeader from "@/common/AppHeader.vue";

const userState = useUsersModules()

const form = reactive({
  Name: '',
  Org: '',
  SignKey: '',
  SendKey: '',
  Url: '',
} as UserSetting)

const save = () => {
  userState.setting = form
  router.push(ROUTE_NAMES.main)
}
</script>

<style scoped lang="scss" >
.setting__title{
  color: #ff545b;
}

.setting_body{}
</style>
