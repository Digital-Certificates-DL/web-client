<template>
  <div class="certificate">
    <checkbox-field :model-value="isSelected" @click="selectItem" />
    <div class="certificate__img-wrp">
      <img
        class="certificate_img"
        :src="props.user.Img || '/static/branding/template.jpg'"
        alt="certificate"
      />
    </div>

    <p class="certificate__name">
      {{ props.user.Participant }}
    </p>
    <p>
      {{ props.user.Date }}
    </p>
    <div class="certificate__btns">
      <app-button
        class="certificate__btn"
        :text="$t('certificate.mint-text')"
        @click="emit('OpenModal', true, props.user)"
      />

      <app-button
        class="certificate__btn certificate__btn-download"
        @click="window.open(props.user.Certificate, '_blank')"
      >
        <img src="static/branding/download.png" alt="download img" />
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppButton } from '@/common'
import { UserJSONResponse } from '@/types'
import { CheckboxField } from '@/fields'

import { ref } from 'vue'

const isSelected = ref(false)

const emit = defineEmits<{
  (e: 'OpenModal', state: boolean, user: UserJSONResponse): boolean
  (e: 'select', state: boolean, user: UserJSONResponse): boolean
}>()

const props = withDefaults(
  defineProps<{
    user: UserJSONResponse
  }>(),
  {},
)

const selectItem = () => {
  isSelected.value = !isSelected.value
  emit('select', isSelected.value, props.user)
}
</script>

<style lang="scss" scoped>
.certificate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: toRem(20);
  padding-bottom: toRem(10);
  border-bottom: var(--text-primary-dark), toRem(2), solid;
  max-width: toRem(1400);
}

.certificate_img {
  width: toRem(74);
  border-radius: toRem(4);

  @include respond-to(large) {
    width: toRem(74);
    border-radius: toRem(4);
  }
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
