<template>
  <div class="certificate">
    <img class="certificate_img" :src="props.user.attributes.Img" alt="" />
    <p class="certificate__name">
      {{ props.user.attributes.Participant }}
    </p>
    <p>
      {{ props.user.attributes.Date }}
    </p>
    <app-button @click="openModal">
      {{ mintText }}
    </app-button>
    <app-button>{{ download }}</app-button>
    <input @input="selectUser" type="checkbox" v-model="isSelected" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
import AppButton from '@/common/AppButton.vue'
import { UserJSONResponse } from '@/types'

const mintText = 'Make sbt issuance'
const download = 'Download'
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
</script>

<style lang="scss" scoped>
.certificate {
  display: flex;
  justify-content: space-between;
}

.certificate_img {
  width: toRem(100);
}
.certificate__name{
  width: toRem(150);
}

</style>
