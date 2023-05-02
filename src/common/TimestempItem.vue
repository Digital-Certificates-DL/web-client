<template>
  <div class="home-item">
    <div class="home-item__name">
      <p>{{ props.name }}</p>
    </div>
    <div class="home-item__date">
      <p>{{ props.date }}</p>
    </div>
    <div class="home-item__download">
      <img src="/static/branding/dowlaod.png" alt="download" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserJSONResponse } from '@/types'

const props = withDefaults(
  defineProps<{
    name: string
    date: string
    user: UserJSONResponse
  }>(),
  {
    name: '',
    date: '',
    user: undefined,
  },
)

const emit = defineEmits<{
  (e: 'select', user: UserJSONResponse): boolean
}>()

const selectFile = (user: UserJSONResponse) => {
  emit('select', user)
}
</script>

<style scoped lang="scss">
.home-item {
  display: flex;
  justify-content: space-between;
  border: var(--border-primary-main), toRem(1), solid;
  border-radius: toRem(8);
  padding: toRem(16);
}

.home-item__name,
.home-item__date {
  width: 30%;
  display: flex;
  justify-content: center;
  text-align: center;
}

.home-item__download {
  padding: toRem(16);
  background: var(--app-button-bg);
}
</style>
