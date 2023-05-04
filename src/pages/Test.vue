<template>
  <div>
    <input-field v-model="form.test" />
    <app-button @click="test" />
  </div>
</template>

<script lang="ts" setup>
import InputField from '@/fields/InputField.vue'
import { reactive } from 'vue'
import { Bitcoin } from '@/utils'
import AppButton from '@/common/AppButton.vue'
import btc from '@/utils/bitcoin.util'
const form = reactive({
  test: '',
})

const test = async () => {
  const bitcoin = new Bitcoin()
  console.log(form.test)
  const UTXOs = await bitcoin.getUTXOBip32Testnet(form.test)

  console.log('start prepare ')
  for (let i = 0; i < 4; i++) {
    const tx = await bitcoin.PrepareLegacyTXTestnet(form.test)
    console.log('tx: ', tx)
    const hex = tx?.hex || ''
    const exAddress = tx?.exAddress || ''
    const exPath = tx?.exPath || ''
    const balance = tx?.balance || -1
    if (hex === '' || exAddress === '' || exPath === '' || balance === -1) {
      return
    }
    console.log('tx: ', tx)
    if (tx === undefined) {
      console.log('continue')
      continue
    }
    const resp = await bitcoin.SendToTestnet(hex)
    console.log('resp: ', resp)
    bitcoin.setNewUTXO(exAddress, exPath, resp.data.tx.hash, balance)
    console.log('set')
  }
  console.log(UTXOs)
}
</script>

<style scoped></style>
