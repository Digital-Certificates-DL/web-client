<template>
  <div class="home-item">
    <div class="home-item__img-wrp">
      <div v-if="props.img === ''">
        <img
          :src="props.img || '/branding/template.jpg'"
          class="home-item__img"
          alt="not found"
        />
      </div>
      <div v-else>
        <img
          class="home-item__img"
          :src="props.img || '/branding/template.jpg'"
          alt="error"
        />
      </div>
    </div>
    <div class="home-item__title">
      <p>{{ props.title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  img?: string
  title?: string
}>()
</script>

<style scoped lang="scss">
.home-item__img {
  width: toRem(314);
  height: toRem(222);
  border-radius: toRem(8);
}
</style>
