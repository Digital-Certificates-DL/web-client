<template>
  <div class="error-modal">
    <div class="error-modal__back">
      <div class="error-modal__window">
        <div class="error-modal__data">
          <error-message
            class="error-modal__data-err"
            :message="props.message"
          />
          <app-button text="close" @click="closeModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ErrorMessage from '@/common/ErrorMessage.vue'
import AppButton from '@/common/AppButton.vue'

const props = withDefaults(
  defineProps<{
    message: string
  }>(),
  {
    message: '',
  },
)

const emit = defineEmits<{
  (e: 'close'): boolean
}>()

const closeModal = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.error-modal__window {
  width: 30%;
  height: 30%;
  background: white;
  border-radius: 1rem;
  justify-items: center;
  align-items: center;
  display: grid;
}

.error-modal__back {
  backdrop-filter: blur(1rem);
  background: #00000080;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-modal__data {
  justify-items: center;
  align-items: center;
  display: grid;
}

.error-modal__data-err {
  height: toRem(60);
}
</style>
