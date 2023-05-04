<template>
  <div class="template__body">
    <div>
      <div v-if="img == 0" class="template__img-wrp">
        <img
          class="template__img"
          src="static/branding/default-template.png"
          alt="error"
        />
      </div>
      <div v-else class="template__img-wrp">
        <img class="template__img" :src="img" alt="error" />
      </div>

      <file-field :color="'success'" @submitted="getBackgroundImg" />
      <div class="complex-form__actions">
        <app-button type="submit" text="Submit" @click="createTemplate" />
        <app-button type="submit" text="Submit" @click="Prepare" />
      </div>
    </div>
    <template-form @update-template="getTemplateData" />
  </div>
</template>

<script setup lang="ts">
import { TemplateForm } from '@/forms'
import { api } from '@/api'
import {
  CreateTemplateResponse,
  TemplateRequestData,
  TemplateTypes,
} from '@/types'
import { router } from '@/router'
import { ROUTE_NAMES } from '@/enums'
import { ref } from 'vue'
import FileField from '@/fields/FileField.vue'
import { AppButton } from '@/common'

const img = ref('')
const templateData = {
  template: {} as TemplateTypes,
  backgroundImg: img.value,
  isCompleted: false,
} as TemplateRequestData
const getBackgroundImg = (preparedImg: string) => {
  img.value = preparedImg
}

const prepareImg = (img: Uint8Array) => {
  return 'data:image/png;base64,' + img.toString()
}

const getTemplateData = (template: TemplateTypes) => {
  templateData.template = template
  templateData.backgroundImg = img.value
}

const createTemplate = async (templateData: TemplateRequestData) => {
  const res = await api.post<CreateTemplateResponse>(
    '/integrations/ccp/certificate/template',
    {
      body: {
        data: {
          attributes: {
            template: templateData.template,
            background_img: base64ToArrayBuffer(templateData.backgroundImg),
            is_completed: templateData.isCompleted,
          },
        },
      },
    },
  )
  img.value = prepareImg(res.data.attributes.prepared_img)
  if (templateData.isCompleted) {
    await router.push(ROUTE_NAMES.main)
  }
}

const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}
</script>

<style lang="scss" scoped>
.template__body {
  margin: auto;
  max-width: toRem(1100);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
}

.template__img {
  max-width: toRem(800);
}
</style>
