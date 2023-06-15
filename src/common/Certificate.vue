<template>
  <div class="certificate">
    <checkbox-field v-model="isSelected" @click="selectItem" />
    <div class="certificate__img-wrp">
      <img
        class="certificate_img"
        :src="user.img || '/branding/template.jpg'"
        :alt="$t('certificate.img-alt')"
      />
    </div>

    <p class="certificate__name">
      {{ user.participant }}
    </p>
    <p>
      {{ user.date }}
    </p>
    <div class="certificate__btns">
      <app-button
        class="certificate__btn"
        :text="$t('certificate.mint-text')"
        @click="emit('open-modal', user)"
      />

      <app-button
        class="certificate__btn certificate__btn-download"
        :icon-left="$icons.download"
        @click="window.open(user.certificate, '_blank', 'noopener')"
      />
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
  (e: 'open-modal', user: UserJSONResponse): boolean
  (e: 'select', state: boolean, user: UserJSONResponse): boolean
}>()

const props = defineProps<{
  user: UserJSONResponse
}>()

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
  border-bottom: var(--border-primary-dark), toRem(2), solid;
}

.certificate_img {
  width: toRem(74);
  border-radius: toRem(4);

  @include respond-to(medium) {
    width: toRem(54);
  }

  @include respond-to(xmedium) {
    width: toRem(64);
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
