<template>
  <div class="template-item">
    <checkbox-field v-model="isSelected" @click="clickItem" />
    <div class="template-item__body">
      <div
        class="template-item__img-wrp"
        tabindex="0"
        :aria-label="$t('template-item.aria-choose-template-item')"
        @click="clickItem"
      >
        <img
          class="template-item__img"
          :src="template.background_img || '/branding/template.jpg'"
          :alt="$t('template-item.img-alt')"
        />
      </div>
      <p>
        {{ template.template_name }}
      </p>

      <div class="template-item__btns">
        <app-button
          :text="$t('template-item.remove-btn-text')"
          @click="removeTemplate"
        />
        <app-button
          :text="$t('template-item.select-template-btn-text')"
          @click="clickItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppButton } from '@/common'
import { TemplateJSONItem } from '@/types'
import { CheckboxField } from '@/fields'

import { ref } from 'vue'

const emit = defineEmits<{
  (event: 'select', isSelected: boolean): boolean
  (event: 'remove', id: string): boolean
}>()

const props = defineProps<{
  template: TemplateJSONItem
}>()

const isSelected = ref(false)

const clickItem = () => {
  isSelected.value = !isSelected.value
  emit('select', isSelected.value)
}

const removeTemplate = () => {
  emit('remove', props.template.template_id)
}
</script>

<style lang="scss" scoped>
.template-item {
  display: flex;
  align-items: center;
  border-bottom: toRem(1) solid var(--border-primary-main);
}

.template-item__body {
  display: grid;
  grid-template-columns: 1fr 6fr 2fr;
  gap: toRem(50);
  width: 100%;
  align-items: center;
}

.template-item__img-wrp {
  display: flex;
  align-items: center;
  width: toRem(74);
}

.template-item__img {
  width: 100%;
  border-radius: toRem(4);
  margin-right: toRem(10);

  @include respond-to(large) {
    width: toRem(74);
    border-radius: toRem(4);
  }
}

.template-item__btn-download {
  font-size: toRem(20);
}

.template-item__btns {
  max-width: toRem(200);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
</style>
