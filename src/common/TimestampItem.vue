<template>
  <div class="timestamp-item">
    <checkbox-field
      :model-value="isSelected"
      v-show="isShow"
      @click="selectItem"
    />
    <div class="timestamp-item__body">
      <div class="timestamp-item__name">
        <p>{{ props.name }}</p>
      </div>
      <div class="timestamp-item__date">
        <p>{{ props.date }}</p>
      </div>

      <app-button
        class="certificate__btn"
        @click="emit('open-modal', true, props.user)"
        :text="$t('certificate.mint-text')"
      />

      <app-button
        class="certificate__btn"
        @click="selectItem"
        :text="$t('certificate.timestamp-btn')"
      />

      <app-button
        class="certificate__btn certificate__btn-download"
        @click="window.open(props.user.certificate, '_blank')"
      >
        <img src="/branding/download.png" alt="download img" />
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CertificateJSONResponse } from '@/types'
import CheckboxField from '@/fields/CheckboxField.vue'
import { ref } from 'vue'
import AppButton from '@/common/AppButton.vue'
const isSelected = ref(false)

const props = withDefaults(
  defineProps<{
    isShow: boolean
    name: string
    date: string
    user: CertificateJSONResponse
  }>(),
  {
    isShow: false,
  },
)

const emit = defineEmits<{
  (e: 'open-modal', state: boolean, user: CertificateJSONResponse): boolean
  (e: 'select', state: boolean, user: CertificateJSONResponse): boolean
}>()

const selectItem = () => {
  isSelected.value = !isSelected.value
  emit('select', isSelected.value, props.user)
}
</script>

<style scoped lang="scss">
.timestamp-item {
  display: flex;
  justify-content: space-between;
  border: var(--border-primary-main), toRem(1), solid;
  border-radius: toRem(8);
  padding: toRem(16);
  align-content: center;
  align-items: center;
}

.timestamp-item__body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.timestamp-item__name,
.timestamp-item__date {
  width: 30%;
  display: flex;
}

.timestamp-item__download {
  background: var(--app-button-bg);
}
</style>
