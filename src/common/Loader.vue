<template>
  <div class="loader">
    <template v-if="scheme === 'spinner'">
      <spinner />
      <p>{{ title }}</p>
    </template>
    <template v-else-if="scheme === 'skeleton'">
      <skeleton v-bind="$attrs" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Spinner, Skeleton } from '@/common'

type LOADER_TYPE = 'spinner' | 'skeleton'

withDefaults(
  defineProps<{
    scheme?: LOADER_TYPE
    title?: string
  }>(),
  {
    scheme: 'spinner',
    title: '',
  },
)
</script>

<style lang="scss" scoped>
.loader {
  overflow: hidden;
  display: grid;
  grid-row: inherit;
  place-items: center;
}
</style>
