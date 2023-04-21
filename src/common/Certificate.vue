<template>
  <div class="generation">
    <img class="certificate_img" :src="props.user.attributes.Img" alt="" />
    <p class="certificate__name">
      {{ props.user.attributes.Participant }}
    </p>
    <p>
      {{ props.user.attributes.Date }}
    </p>
    <div class="certificate__btns">
      <app-button class="certificate__btn" @click="openModal">
        {{ mintText }}
      </app-button>
      <app-button class="certificate__btn certificate__btn-download" @click="downloadPdf">&#8595;</app-button>
      <input @input="selectUser" type="checkbox" v-model="isSelected" />

    </div>
  </div>
  <hr>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
import AppButton from '@/common/AppButton.vue'
import { UserJSONResponse } from '@/types'

const mintText = 'Make sbt issuance'
defineComponent({
  components: { AppButton },
})
const isSelected = false

const props = withDefaults(
  defineProps<{
    user: UserJSONResponse
  }>(),
  {
    user: undefined,
  },
)

const emit = defineEmits<{
  (e: 'openModal', state: boolean, user: UserJSONResponse): boolean
  (e: 'selectForTimestamp', state: boolean, user: UserJSONResponse): boolean
}>()

const openModal = () => {
  emit('openModal', true, props.user)
}

const selectUser = () => {
  console.log('is selected', !isSelected)
  emit('selectForTimestamp', !isSelected, props.user)
}

const downloadPdf = () => {
  console.log("link: ", props.user.attributes.Certificate)
  window.open(props.user.attributes.Certificate, '_blank');

}
</script>

<style lang="scss" scoped>
.generation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
}

.certificate_img {
  width: toRem(100);
}
.certificate__name{
  width: toRem(150);
}

.certificate__btn{

  width: toRem(140);
  height: toRem(50);
}

.certificate__btn-download{
  width: toRem(50);
margin-left: toRem(20);
  font-size: toRem(20);
}

.certificate__btns{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

</style>
