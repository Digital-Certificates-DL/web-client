<template>
  <div>
    <div class="pdf-viewer__body">
      <upload-template @submitted="handleSubmit" />
      <template-form @submitted="createTemplate" />
      <img :src="img" alt="error" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UploadTemplate, TemplateForm } from '@/forms'
import { api } from '@/api'
import {
  CreateTemplateResponse,
  TemplateTypes,
  UserJSONResponseList,
} from '@/types'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { ref } from 'vue'

const img = ref('')
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

const prepareImg = (img: Uint8Array) => {
  return 'data:image/png;base64,' + img.toString()
}

const createTemplate = async (
  template: TemplateTypes,
  backgroundImg: Uint8Array,
  isCompleted?: boolean,
) => {
  const res = await api.post<CreateTemplateResponse>(
    '/integrations/ccp/certificate/template',
    {
      data: {
        attributes: {
          template: template,
          background_img: Uint8Array,
          is_completed: isCompleted,
        },
      },
    },
  )
  img.value = prepareImg(res.data.attributes.prepared_img)
  if (isCompleted) {
    await router.push(ROUTE_NAMES.home)
  }
}
</script>

<style scoped></style>
