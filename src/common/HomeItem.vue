<template>
  <div class="home-item">
    <div class="home-item__image">
      <p>{{ props.img }}</p>
    </div>
    <div class="home-item__title">
      <p>{{ props.title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    img: string
    title: string
  }>(),
  {
    img: '',
    title: '',
  },
)
</script>

<style scoped lang="scss">
.home-item__image {
  max-width: toRem(400);
  max-height: toRem(400);
}
</style>
