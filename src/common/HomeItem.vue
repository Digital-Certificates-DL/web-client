<template>
  <div class="home-item">
    <div class="home-item__image-wrp">
      <div v-if="props.img === ''">
        <img src="static/branding/template.jpg" class="home-item__img" alt="" />
      </div>
      <div v-else>
        <img class="certificate_img" :src="props.img" alt="" />
        <p>{{ props.img }}</p>
      </div>
    </div>
    <div class="home-item__title">
      <p>{{ props.title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    img?: string
    title?: string
  }>(),
  {
    img: '',
    title: '',
  },
)
</script>

<style scoped lang="scss">
//.home-item__image-wrp {
//  max-width: toRem(00);
//  max-height: toRem(100);
//}
.home-item__img {
  width: toRem(200);
  //height: toRem(150);
}
</style>
