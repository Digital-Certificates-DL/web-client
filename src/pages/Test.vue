<script setup lang="ts">
import { Bitcoin } from '@/utils'
// eslint-disable-next-line no-console
console.log('test')

const btc = new Bitcoin()
await btc.getUTXOBip32Blockstream(
  'corn rice govern audit amount ankle always rude prevent convince mention all',
  'testnet',
)
await btc.PrepareLegacyTX(
  'corn rice govern audit amount ankle always rude prevent convince mention all',
)
</script>

<style scoped lang="scss"></style>
