<template>
  <div class="home-nav">
    <div class="home-nav__info">
      <p>{{ props.title }}</p>
      <p>{{ props.description }}</p>
    </div>
    <div class="home-nav__btn">
      <app-button :text="name" @click="emit('active')" />
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

<style scoped></style>
