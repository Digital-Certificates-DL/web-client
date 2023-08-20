<template>
  <div class="home-navigation">
    <div class="home-navigation__info">
      <h3 class="home-navigation__title">
        {{ title }}
      </h3>
      <p class="home-navigation__description">
        {{ description }}
      </p>
    </div>
    <div class="home-navigation__btns">
      <app-button
        class="home-navigation__btn"
        color="info"
        :text="name"
        @click="emit('active')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton } from '@/common'

withDefaults(
  defineProps<{
    color?: string
    title?: string
    name?: string
    description?: string
    router?: string
  }>(),
  {
    color: 'primary',
    title: '',
    name: '',
    description: '',
    router: '',
  },
)

const emit = defineEmits<{
  (e: 'active'): boolean
}>()
</script>

<style lang="scss" scoped>
.home-navigation {
  border: toRem(2) solid var(--border-primary-main);
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: toRem(8);
  max-height: toRem(150);
}

.home-navigation__title {
  white-space: nowrap;
  margin-bottom: toRem(10);
}

.home-navigation__description {
  color: var(--text-secondary-light);
  font-size: toRem(14);
}

.home-navigation__info {
  width: 50%;
}

.home-navigation__btns {
  width: 30%;
  display: flex;
  justify-content: right;
  margin-right: toRem(20);
}
</style>
