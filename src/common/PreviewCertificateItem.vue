<template>
  <div class="preview-certificate-item">
    <div class="preview-certificate-item__img-wrp">
      <img
        class="preview-certificate-item__img"
        :src="img"
        :alt="$t('preview-certificate-item.img-alt')"
      />
    </div>
    <div class="preview-certificate-item__title">
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
    img: '/static/branding/template.jpg',
    title: '',
  },
)
</script>

<style scoped lang="scss">
.preview-certificate-item__img {
  max-width: toRem(314);
  max-height: toRem(222);
  width: 100%;
  height: 100%;
  border-radius: toRem(8);
}
</style>
