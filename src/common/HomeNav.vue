<template>
  <div class="home-nav">
    <div class="home-nav__info">
      <h3 class="home-nav__title">
        {{ props.title }}
      </h3>
      <p class="home-nav__description">
        {{ props.description }}
      </p>
    </div>
    <div class="home-nav__btns">
      <app-button
        class="home-nav__btn"
        :color="'info'"
        :text="props.name"
        @click="emit('active')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/common/AppButton.vue'

const props = defineProps<{
  color: string
  title: string
  name: string
  description: string
  router: string
}>()

const emit = defineEmits<{
  (e: 'active'): boolean
}>()
</script>

<style lang="scss" scoped>
.home-nav {
  width: 40%;
  border: toRem(1) solid var(--border-primary-main);
  padding: toRem(20);
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: toRem(652);
  height: toRem(160);

  /* border/border-tertiary */

  border: toRem(2) solid var(--background-primary-dark);
  border-radius: toRem(8);
}

.home-nav__description {
  color: var(--border-primary-dark);
  font-size: toRem(12);
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

.home-nav__btn {
  width: 70%;
}
</style>
