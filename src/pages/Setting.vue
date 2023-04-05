<template>
  <div>
    <input-field
      label="SignKey"
      type="text"
      v-model="form.SignKey"
      placeholder="Sign key"
    /><input-field
      label="SignKey"
      type="text"
      v-model="form.SendKey"
      placeholder="Send key"
    /><input-field
      label="Url"
      type="text"
      v-model="form.Url"
      placeholder="Url"
    />
    <app-button  @click="save"/>
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
import { reactive } from 'vue'
import { UserSetting } from '@/types'
import { useUsersModules } from '@/store/modules/use-users.modules'
import {router} from "@/router";
import {ROUTE_NAMES} from "@/enums";
import AppButton from "@/common/AppButton.vue";

const userState = useUsersModules()

const form = reactive({
  SignKey: '',
  SendKey: '',
  Url: '',
} as UserSetting)

const save = () => {
  userState.setting = form
  router.push(ROUTE_NAMES.main)
}

</script>

<style scoped></style>
