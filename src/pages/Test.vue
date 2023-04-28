<template>
  <div>
    <input-field model-value="form.test" />
    <app-button @click="test" />
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
import { reactive } from 'vue'
import { Bitcoin } from '@/utils'
import AppButton from '@/common/AppButton.vue'
const form = reactive({
  test: '',
})

const test = async () => {
  const UTXOs = await Bitcoin.getUTXOBip32Main(form.test)
  console.log(UTXOs)
}
</script>

<style scoped></style>
