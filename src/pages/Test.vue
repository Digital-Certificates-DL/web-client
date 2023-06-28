<script setup lang="ts">
import { Bitcoin } from '@/utils'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const btc = new Bitcoin()
btc.getUTXOBip32MainBlockstream(userStore.setting.bip39MnemonicPhrase)
</script>

<style scoped lang="scss"></style>
