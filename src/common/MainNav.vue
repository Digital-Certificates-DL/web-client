<template>
  <div :class="mainNavClasses">
    <app-button
      class="main-nav__btn"
      :color="props.color"
      :text="props.title"
      :route="route"
    />
    <p class="main-nav__description">
      {{ props.description }}
    </p>
    <p class="main-nav__description" :class="mainNavClasses">
      {{ props.body }}
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
  ['main-nav', `main-nav--${props.size}`].join(' '),
)
</script>

<style lang="scss" scoped>
.nav-button {
  display: block;

  &--large {
    max-width: toRem(304);
  }
}

.main-nav__description {
  @include respond-to(xmedium) {
    font-size: toRem(14);
  }
}

.main-nav__btn {
  width: toRem(89);
  height: toRem(34);
  margin-bottom: toRem(8);
}
</style>
