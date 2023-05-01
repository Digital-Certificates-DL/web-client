<template>
  <div class="home-nav">
    <div class="home-nav__info">
      <p class="home-nav__test home-nav__title">
        {{ props.title }}
      </p>
      <p class="home-nav__test home-nav__description">
        {{ props.description }}
      </p>
    </div>
    <div class="home-nav__btns">
      <app-button
        class="home-nav__btn"
        :text="props.name"
        @click="emit('active')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/common/AppButton.vue'

const props = withDefaults(
  defineProps<{
    color: string
    title: string
    name: string
    description: string
    router: string
  }>(),
  {
    color: '',
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
.home-nav {
  width: 40%;
  border-radius: toRem(10);
  border: toRem(1) solid var(--border-primary-main);
  padding: toRem(20);
  display: flex;
  justify-content: space-between;
  align-items: center;
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
