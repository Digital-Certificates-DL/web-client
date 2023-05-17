<template>
  <div :class="navClasses">
    <app-button
      class="main-nav__btn"
      :color="props.color"
      :text="props.title"
    />
    <p class="main-nav__description">
      {{ props.description }}
    </p>
    <p :class="navClasses">
      {{ props.body }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { AppButton } from '@/common'

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
  }>(),
  {
    color: 'primary',
    size: 'medium',
  },
)

const navClasses = computed(() =>
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

.main-nav__btn {
  width: toRem(89);
  height: toRem(34);
  //font-size: toRem(52);
  margin-bottom: toRem(8);
}
</style>
