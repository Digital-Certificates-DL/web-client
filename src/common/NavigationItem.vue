<template>
  <div :class="navigationItemClasses">
    <app-button
      class="navigation-item__btn"
      :color="color"
      :text="title"
      :route="route"
    />
    <p class="navigation-item__description">
      {{ description }}
    </p>
    <p class="navigation-item__description" :class="navigationItemClasses">
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

const navigationItemClasses = computed(() =>
  ['navigation-item', `navigation-item--${props.size}`].join(' '),
)
</script>

<style lang="scss" scoped>
.navigation-item__description {
  @include respond-to(xmedium) {
    font-size: toRem(14);
  }
}

.navigation-item__btn {
  width: toRem(89);
  height: toRem(34);
  margin-bottom: toRem(8);
}
</style>
