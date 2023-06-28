<script setup lang="ts">
import { Bitcoin } from '@/utils'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const btc = new Bitcoin()
btc.getUTXOBip32MainBlockstream(
  'corn rice govern audit amount ankle always rude prevent convince mention all',
)
</script>

<style scoped lang="scss"></style>
