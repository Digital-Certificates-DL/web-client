<template>
  <div class="nav-button">
    <app-button :text="props.title" class="navbar__btn" />
    <p class="nav-button__description">
      {{ props.description }}
    </p>
    <p class="nav-button__body">
      {{ props.body }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    color: string
    title: string
    description: string
    body: string
  }>(),
  {
    color: '',
    title: '',
    description: '',
    body: '',
  },
)

import AppButton from '@/common/AppButton.vue'
</script>

<style lang="scss" scoped>
.nav-button{
  display: block;
  min-width: toRem(400);
}
.nav-button__btn {
  width: toRem(90);
  height: toRem(40);
}

.nav-button__description {
  color: #000a12;
}
</style>
