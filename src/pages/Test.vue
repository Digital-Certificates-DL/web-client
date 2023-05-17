<template>
  <div class="form-container">
    <div
      class="image-container"
      ref="imageContainer"
      @click="setPosition($event)"
    >
      <!--      <img :src="uploadedImage" alt="Uploaded Image" />-->
      <div
        v-for="(field, index) in fields"
        :key="index"
        class="input-container"
        :style="{ left: field.x + 'px', top: field.y + 'px' }"
      >
        <input type="text" v-model="field.text" @blur="hideInput(index)" />
        <div
          class="input-drag-handle"
          @mousedown="startDrag($event, index)"
        ></div>
      </div>
    </div>
    <button @click="saveTextPositions">
Save Text Positions
</button>
  </div>
</template>

<script lang="ts">
import { ref, nextTick } from 'vue'

export default {
  setup() {
    const uploadedImage = ref('')
    const fields = ref([])
    const imageContainer = ref(null)
    const dragData = ref({
      draggingIndex: null,
      offsetX: 0,
      offsetY: 0,
    })

    const setPosition = (event: MouseEvent) => {
      const rect = (imageContainer.value as HTMLElement).getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      fields.value.push({ x, y, text: '' })
      nextTick(() => {
        const lastIndex = fields.value.length - 1
        const inputField = document.querySelector(
          `.input-container:nth-child(${lastIndex + 1}) input`,
        )
        ;(inputField as HTMLInputElement).focus()
      })
    }

    const hideInput = (index: number) => {
      fields.value[index].text = fields.value[index].text.trim()
    }

    const startDrag = (event: MouseEvent, index: number) => {
      dragData.value.draggingIndex = index
      const inputContainer = document.querySelector(
        `.input-container:nth-child(${index + 1})`,
      )
      const rect = (inputContainer as HTMLElement).getBoundingClientRect()
      dragData.value.offsetX = rect.left - event.clientX
      dragData.value.offsetY = rect.top - event.clientY
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', stopDrag)
    }

    const handleDrag = (event: MouseEvent) => {
      const newX = event.clientX + dragData.value.offsetX
      const newY = event.clientY + dragData.value.offsetY
      fields.value[dragData.value.draggingIndex].x = newX
      fields.value[dragData.value.draggingIndex].y = newY
    }

    const stopDrag = () => {
      dragData.value.draggingIndex = null
      dragData.value.offsetX = 0
      dragData.value.offsetY = 0
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('mouseup', stopDrag)
    }

    const saveTextPositions = () => {
      // Save the text positions to variables or a store for later use
      // For example: this.$store.commit('setTextPositions', fields.value);
    }

    return {
      uploadedImage,
      fields,
      imageContainer,
      setPosition,
      hideInput,
      startDrag,
      saveTextPositions,
    }
  },
}
</script>

<style lang="scss" scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  position: relative;
  margin-bottom: 20px;
  width: toRem(500);
  height: toRem(500);
  cursor: crosshair; /* Added cursor style to indicate clickability */
}

.input-container {
  position: absolute;
  display: flex; /* Added to align input and drag handle horizontally */
}

.input-container input {
  width: 200px;
}

.input-drag-handle {
  width: 20px;
  height: 20px;
  background-color: #ccc;
  cursor: move; /* Added cursor style to indicate draggability */
  margin-left: 5px; /* Added spacing between input and drag handle */
}
</style>
