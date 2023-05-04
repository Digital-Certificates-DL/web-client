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
      <app-button
        class="certificate__btn"
        @click="emit('openModal', true, props.user)"
      >
        {{ $t('certificate.mint-text') }}
      </app-button>
      <app-button
        class="certificate__btn certificate__btn-download"
        @click="window.open(props.user.attributes.Certificate, '_blank')"
      >
        <img src="static/branding/download.png" alt="download img" />
      </app-button>
      <input
        v-model="isSelected"
        type="checkbox"
        @input="emit('select', !isSelected, props.user)"
      />
    </div>
  </div>
  <hr />
</template>

<script setup lang="ts">
import AppButton from '@/common/AppButton.vue'
import { UserJSONResponse } from '@/types'

const isSelected = false

const props = withDefaults(
  defineProps<{
    user: UserJSONResponse
  }>(),
  {},
)

const emit = defineEmits<{
  (e: 'openModal', state: boolean, user: UserJSONResponse): boolean
  (e: 'select', state: boolean, user: UserJSONResponse): boolean
}>()
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

.certificate__name {
  width: toRem(150);
}

.certificate__btn {
  width: toRem(140);
  height: toRem(50);
}

.certificate__btn-download {
  width: toRem(50);
  margin-left: toRem(20);
  font-size: toRem(20);
}

.certificate__btns {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
