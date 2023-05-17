<template>
  <modal
    :is-shown="isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="loader-modal">
        <loader />
      </div>
      <p>{{ props.state }}</p>
    </template>
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
  width: toRem(400);
  height: toRem(600);
  background: var(--white);
  border-radius: toRem(15);
  padding: toRem(24);
  display: grid;
}
</style>
