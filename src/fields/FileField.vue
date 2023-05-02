<template>
  <div class="file-field">
    <div class="file-field__form">
      <input type="file" pattern="Upload file" @input="selectFile" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'submitted', img: Uint8Array): boolean
}>()

const selectFile = (file: Uint8Array) => {
  emit('submitted', file)
}
</script>

<style scoped></style>
