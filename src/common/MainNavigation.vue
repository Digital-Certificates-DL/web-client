<template>
  <div :class="mainNavClasses">
    <app-button
      class="main-navigation__btn"
      :color="color"
      :text="title"
      :route="route"
    />
    <p class="main-navigation__description">
      {{ description }}
    </p>
    <p class="main-navigation__description" :class="mainNavClasses">
      {{ body }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { AppButton } from '@/common'
import { LocationAsRelativeRaw } from 'vue-router'

type COLORS =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'

type SIZES = 'large' | 'medium' | 'small' | 'x-small' | 'default'

const props = withDefaults(
  defineProps<{
    color: COLORS
    title: string
    description: string
    body: string
    size?: SIZES
    route?: LocationAsRelativeRaw
  }>(),
  {
    color: 'primary',
    size: 'medium',
    route: undefined,
  },
)

const mainNavClasses = computed(() =>
  ['main-navigation', `main-navigation--${props.size}`].join(' '),
)
</script>

<style lang="scss" scoped>
.main-navigation__description {
  @include respond-to(xmedium) {
    font-size: toRem(14);
  }
}

.main-navigation__btn {
  width: toRem(89);
  height: toRem(34);
  margin-bottom: toRem(8);
}
</style>
