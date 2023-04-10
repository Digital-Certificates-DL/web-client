<template>
  <div>
    <img :src="props.user.attributes.Img" alt="" />
    <p>
      {{ props.user.attributes.Participant }}
    </p>
    <p>
      {{ props.user.attributes.Date }}
    </p>
    <app-button @click="openModal">
      {{ mintText }}
    </app-button>
    <app-button>{{ download }}</app-button>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
import AppButton from '@/common/AppButton.vue'
import { UserJSONResponse } from '@/types'

const mintText = 'Make sbt issuance'
const download = '>'
defineComponent({
  components: { AppButton },
})

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
}>()

const openModal = () => {
  emit('openModal', true, props.user)
}
</script>

<style scoped></style>
