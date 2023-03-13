<template>
  <div>
    <div class="pdf-viewer__body">
      <upload-template @submitted="handleSubmit" />
      <complex-form @submitted="createTemplate" />
      <img :src="img" alt="error" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UploadTemplate, ComplexForm } from '@/forms'

import { TemplateTypes } from '@/types'
import { updateTemplate } from '@/helpers/update-template.helpers'

let img
let fileSlice: string

const convertBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      resolve(fileReader.result)
    }
    fileReader.onerror = error => {
      reject(error)
    }
  })
}

const handleSubmit = async (file: File) => {
  const bytes = await convertBase64(file)
  fileSlice = String(bytes)

}

const createTemplate = (tmp: TemplateTypes) => {
  tmp.File = fileSlice

  if (tmp.File != undefined) {
    const res = updateTemplate(tmp)
    img = res
  }
}
</script>

<style scoped></style>
