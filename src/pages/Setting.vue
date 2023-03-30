<template>
  <div>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Note.Y"
      placeholder="note position(y)"
    /><input-field
      label="form.field1"
      type="text"
      v-model="form.Note.Y"
      placeholder="note position(y)"
    /><input-field
      label="form.field1"
      type="text"
      v-model="form.Note.Y"
      placeholder="note position(y)"
    />
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
import { reactive } from 'vue'
import { UserSetting } from '@/types'
import { useUsersModules } from '@/store/modules/use-users.modules'

const userState = useUsersModules()

const form = reactive({
  SignKey: '',
  SendKey: '',
  Url: '',
} as UserSetting)

userState.setting = form
</script>

<style scoped></style>
