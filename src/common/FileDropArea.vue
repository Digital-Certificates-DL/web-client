<template>
  <div
    class="file-drop-area"
    :data-active="isActive"
    @dragenter.prevent="isActive = true"
    @dragover.prevent="isActive = true"
    @dragleave.prevent="isActive = false"
    @drop.prevent="handleFileDrag"
  >
    <div class="file-drop-area__content">
      <icon class="file-drop-area__icon" :name="icon" />

      <label
        class="file-drop-area__label"
        :for="`file-drop-area-${uid}`"
      ></label>
      <input
        class="file-drop-area__text-title"
        type="file"
        multiple
        hidden
        :id="`file-drop-area-${uid}`"
        :disabled="isDisabled"
        :accept="filesType"
        @input="uploadFile"
        @drag="handleFileDrag"
      />
      <p class="file-drop-area__text">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref } from 'vue'
import { ICON_NAMES } from '@/enums'
import { Icon } from '@/common'
import { v4 as uuidv4 } from 'uuid'

withDefaults(
  defineProps<{
    icon: ICON_NAMES
    description: string
    filesType: string
    isDisabled?: boolean
  }>(),
  {
    isDisabled: false,
  },
)

const uid = uuidv4()
const files = ref<File[]>([])
const isActive = ref(false)

const emit = defineEmits<{
  (e: 'files-uploaded', files: File[]): void
}>()

const uploadFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFiles = target.files
  files.value = [...selectedFiles!]
  emit('files-uploaded', files.value)
}

const handleFileDrag = (e: DragEvent) => {
  isActive.value = false
  const fileList = e.dataTransfer!.files
  files.value = [...fileList]
  emit('files-uploaded', files.value)
}
</script>

<style lang="scss" scoped>
.file-drop-area {
  border: toRem(2) dashed var(--border-primary-light);
  text-align: center;
  cursor: pointer;
  position: relative;
  border-radius: toRem(8);
}

.file-drop-area__content {
  display: grid;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding-top: toRem(5);
}

.file-drop-area__icon {
  width: toRem(33);
  height: toRem(37);
  margin: auto;

  @include respond-to(large) {
    width: toRem(30);
    height: toRem(30);
  }
}

.file-drop-area__label {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.file-drop-area__text {
  font-style: normal;
  margin: auto;
  max-width: 60%;

  @include respond-to(large) {
    font-size: toRem(14);
  }
}

input[type='file']::file-selector-button {
  display: none;
}
</style>
