<template>
  <modal
    :is-shown="props.isShown"
    @update:is-shown="(value: boolean) => emit('update:is-shown', value)"
  >
    <template #default="{ modal }">
      <div class="error-modal">
        <error-message class="error-modal__data-err" :message="props.message" />
        <app-button text="$t('error-modal.close-btn')" @click="modal.close" />
      </div>
    </template>
  </modal>
</template>

<script lang="ts" setup>
import ErrorMessage from '@/common/ErrorMessage.vue'
import { AppButton, Modal } from '@/common'

const props = withDefaults(
  defineProps<{
    isShown: boolean
    message: string
  }>(),
  {
    isShown: false,
    message: '',
  },
)

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()
</script>

<style lang="scss" scoped>
.error-modal {
  width: toRem(400);
  height: toRem(600);
  background: var(--white);
  border-radius: toRem(16);
  display: grid;
  justify-items: center;
  align-items: center;
}

.error-modal__data-err {
  height: toRem(60);
}
</style>
