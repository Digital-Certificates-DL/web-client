<template>
  <app-header />
  <div class="certificate">
    <div class="certificate_name">
      <input-field v-model="address" />
      <app-button @click="mint" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppHeader from '@/common/AppHeader.vue'
import AppButton from '@/common/AppButton.vue'
import InputField from '@/fields/InputField.vue'
import { useErc721 } from '@/composables'

const certificateSBT = useErc721('0x0c4487b8a9dcB460C864293146D2056e2E53c680') //todo make better add to env

let address: string
//0xD656fB4ffdbB09dE24Cd1F25fC323DEbF4FB0886
const mint = async (address: string) => {
  await safeMint(
    address,
    'bafybeihdmrxl4bq3hn2jhcpz2ecyre53dhfolhstowm6jw6bzzfqzs5fbm',
  )
}

const safeMint = async (recipient: string, uri: string) => {
  await certificateSBT.safeMint(recipient, uri)
}
</script>

<style scoped></style>
