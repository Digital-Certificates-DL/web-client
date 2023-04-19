<template>
  <div class="modal__back">
    <div class="modal__window">
      <input-field v-model="form.code" />
      <app-button  class="modal__btn"  text="Give access" @click="getCode" />
      <div class="modal__btns">
        <app-button class="modal__btn" text="Send code" @click="sendCode" />
        <app-button class="modal__btn"  text="Cancel" @click="cancel" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { InputField } from '@/fields'
import { reactive, ref } from 'vue'
import AppButton from '@/common/AppButton.vue'
const form = reactive({
  code: '',
})
const props = withDefaults(
  defineProps<{
    tokenLink: string
  }>(),
  {
    tokenLink: '',
  },
)

const emit = defineEmits<{
  (e: 'closeModal', state: boolean): boolean
  (e: 'withCode', code: string): boolean
}>()

const cancel = () => {
  console.log('closeModal')
  emit('closeModal', false)
}
const sendCode = () => {
  console.log('withCode: ', form.code)
  emit('withCode', form.code)
}

const getCode = () => {
  window.open(props.tokenLink, '_blank');
}
</script>

<style scoped lang="scss">
.modal__window {
  width: 30%;
  height: 70%;
  background: white;
  border-radius: 1rem;
  flex-direction: row;
  padding: toRem(24);
  position: fixed;
  display: grid;
}

.modal__back {
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

.modal__title {
  padding-top: toRem(30);
  padding-bottom: toRem(30);
  margin: auto;
}

.modal__btns {
  display: flex;
  justify-content: space-between;
}

.modal__btn{
  width: toRem(100);
  height: toRem(70);
}
</style>
