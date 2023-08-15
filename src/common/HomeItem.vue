<template>
  <div class="home-item">
    <div class="home-item__img-wrp">
      <img
        class="home-item__img"
        :src="img || '/branding/template.jpg'"
        :alt="$t('home-item.img-alt')"
      />
    </div>
    <div class="home-item__title">
      <p>{{ title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  img?: string
  title?: string
}>()
</script>

<style scoped lang="scss">
.home-item__img {
  max-width: toRem(314);
  max-height: toRem(222);
  width: 100%;
  height: 100%;
  border-radius: toRem(8);
}
</style>
