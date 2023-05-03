<template>
  <div class="nav-button">
    <app-button
      class="nav-button__btn"
      :color="props.color"
      :text="props.title"
    />
    <p class="nav-button__description">
      {{ props.description }}
    </p>
    <p class="nav-button__body">
      {{ props.body }}
    </p>
  </div>
</template>

<script lang="ts" setup>
type COLORS =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'

const props = withDefaults(
  defineProps<{
    color: COLORS
    title: string
    description: string
    body: string
  }>(),
  {
    color: 'primary',
    title: '',
    description: '',
    body: '',
  },
)

import AppButton from '@/common/AppButton.vue'
</script>

<style lang="scss" scoped>
.nav-button {
  display: block;
  min-width: toRem(400);
}

.nav-button__btn {
  width: toRem(100);
  height: toRem(40);
  margin-bottom: toRem(10);
}
</style>
