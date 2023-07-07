<template>
  <div class="home-nav">
    <div class="home-nav__info">
      <h3 class="home-nav__title">
        {{ title }}
      </h3>
      <p class="home-nav__description">
        {{ description }}
      </p>
    </div>
    <div class="home-nav__btns">
      <app-button
        class="home-nav__btn"
        :color="'info'"
        :text="name"
        @click="emit('active')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton } from '@/common'

defineProps<{
  color?: string
  title?: string
  name?: string
  description?: string
  router?: string
}>()

const emit = defineEmits<{
  (e: 'active'): boolean
}>()
</script>

<style lang="scss" scoped>
.home-nav {
  border: toRem(2) solid var(--border-primary-main);
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: toRem(8);
  height: toRem(160);
}

.home-nav__title {
  margin-bottom: toRem(10);
}

.home-nav__description {
  color: var(--border-primary-dark);
  font-size: toRem(14);
}

.home-nav__info {
  width: 50%;
}

.home-nav__btns {
  width: 30%;
  display: flex;
  justify-content: right;
  margin-right: toRem(20);
}
</style>
