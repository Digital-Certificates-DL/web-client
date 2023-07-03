<template>
  <modal
    :is-shown="isShown"
    :is-close-by-click-outside="false"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <div class="loader-modal">
      <loader />
      <h2 class="loader-modal__title">
        {{ props.state }}
      </h2>
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal } from '@/common'
import Loader from '@/common/Loader.vue'

const props = defineProps<{
  state: string
  isShown: boolean
}>()

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.loader-modal {
  width: toRem(350);
  height: toRem(350);
  background: var(--white);
  border-radius: toRem(15);
  padding: toRem(24);
  display: grid;
}

.loader-modal__title {
  margin: auto;
  text-align: center;
}
</style>
