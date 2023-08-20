<template>
  <div class="home-certificate-item">
    <div class="home-certificate-item__img-wrp">
      <img
        class="home-certificate-item__img"
        :src="img"
        :alt="$t('home-certificate-item.img-alt')"
      />
    </div>
    <div class="home-certificate-item__title">
      <p>{{ title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    img?: string
    title?: string
  }>(),
  {
    img: '/branding/template.jpg',
    title: '',
  },
)
</script>

<style scoped lang="scss">
.home-certificate-item__img {
  max-width: toRem(314);
  max-height: toRem(222);
  width: 100%;
  height: 100%;
  border-radius: toRem(8);
}
</style>
