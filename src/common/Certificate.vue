<template>
  <div class="generation">
    <checkbox-field :model-value="isSelected" />
    <div v-if="props.user.Img === undefined">
      <img
        class="certificate_img"
        src="static/branding/apple-touch-icon.png"
        alt=""
      />
    </div>
    <div v-else>
      <img class="certificate_img" :src="props.user.Img" alt="" />
      <p>{{ props.user.Img }}</p>
    </div>
    <p class="certificate__name">
      {{ props.user.Participant }}
    </p>
    <p>
      {{ props.user.Date }}
    </p>

    <div v-if="isGenerated" class="certificate__btns">
      <app-button
        class="certificate__btn"
        @click="emit('openModal', true, props.user)"
      >
        {{ $t('certificate.mint-text') }}
      </app-button>
      <app-button
        class="certificate__btn certificate__btn-download"
        @click="window.open(props.user.Certificate, '_blank')"
      >
        <img src="static/branding/download.png" alt="download img" />
      </app-button>
    </div>
    <div v-else class="certificate__btns">
      <app-button
        class="certificate__btn"
        :text="'Generate'"
        @click="selectItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/common/AppButton.vue'
import { UserJSONResponse } from '@/types'
import { ref } from 'vue'
import CheckboxField from '@/fields/CheckboxField.vue'

const isSelected = ref(false)

const props = defineProps<{
  user: UserJSONResponse
  isGenerated?: boolean
}>()

const emit = defineEmits<{
  (e: 'openModal', state: boolean, user: UserJSONResponse): boolean
  (e: 'select', state: boolean, user: UserJSONResponse): boolean
}>()

const selectItem = () => {
  isSelected.value = !isSelected.value
  emit('select', isSelected.value, props.user)
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
