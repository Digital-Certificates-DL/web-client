<template>
  <div class="home-item">
    <checkbox-field :model-value="isSelected" />

    <div class="home-item__name">
      <p>{{ props.name }}</p>
    </div>
    <div class="home-item__date">
      <p>{{ props.date }}</p>
    </div>

    <app-button
      class="certificate__btn"
      @click="emit('openModal', true, props.user)"
      :text="$t('certificate.mint-text')"
    />

    <app-button
      class="certificate__btn"
      :text="'Generate'"
      @click="selectItem"
    />
    <app-button
      class="certificate__btn certificate__btn-download"
      @click="window.open(props.user.Certificate, '_blank')"
    >
      <img src="static/branding/download.png" alt="download img" />
    </app-button>
  </div>

  <div class="home-item__download">
    <img src="/static/branding/dowlaod.png" alt="download" />
  </div>
</template>

<script setup lang="ts">
import { UserJSONResponse } from '@/types'
import CheckboxField from '@/fields/CheckboxField.vue'
import { ref } from 'vue'
import AppButton from '@/common/AppButton.vue'
const isSelected = ref(false)

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
  (e: 'openModal', state: boolean, user: UserJSONResponse): boolean
  (e: 'select', state: boolean, user: UserJSONResponse): boolean
}>()

const selectItem = () => {
  isSelected.value = !isSelected.value
  console.log(props.user)
  emit('select', isSelected.value, props.user)
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
