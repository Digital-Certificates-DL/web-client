<template>
  <div class="navigation-block-item">
    <div class="navigation-block-item__info">
      <h3 class="navigation-block-item__title">
        {{ title }}
      </h3>
      <p class="navigation-block-item__description">
        {{ description }}
      </p>
    </div>
    <div class="navigation-block-item__btns">
      <app-button
        class="navigation-block-item__btn"
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
    title: string
    name: string
    color?: string
    description?: string
  }>(),
  {
    color: 'primary',
    description: '',
  },
)

const emit = defineEmits<{
  (event: 'active'): boolean
}>()
</script>

<style lang="scss" scoped>
.navigation-block-item {
  display: flex;
  border: toRem(2) solid var(--border-primary-main);
  justify-content: space-evenly;
  align-items: center;
  border-radius: toRem(8);
  padding: toRem(20);
}

.navigation-block-item__title {
  white-space: nowrap;
  margin-bottom: toRem(10);
}

.navigation-block-item__description {
  color: var(--text-secondary-light);
  font-size: toRem(14);
}

.navigation-block-item__info {
  max-width: toRem(250);
  width: 100%;
}

.navigation-block-item__btns {
  max-width: toRem(150);
  width: 100%;
}

.navigation-block-item__btn {
  margin: auto;
}
</style>
