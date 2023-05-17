<template>
  <div class="template">
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
        <div class="template__btns">
          <app-button
            type="submit"
            :scheme="'filled'"
            :color="'success'"
            :size="'medium'"
            text="show"
            @click="createTemplate"
          />
          <app-button
            type="submit"
            :color="'success'"
            :scheme="'filled'"
            text="save"
            :size="'medium'"
            @click="save"
          />
        </div>
      </div>
      <template-form @update-template="getTemplateData" />
    </div>
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
import { AppButton, AppNavbar } from '@/common'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store'

const img = ref('')
const userState = useUserStore()

const templateData = ref({
  template: {} as TemplateTypes,
  backgroundImg: img.value,
  isCompleted: false,
} as TemplateRequestData)
const getBackgroundImg = (preparedImg: string) => {
  console.log(preparedImg)
  img.value = preparedImg
  templateData.value.backgroundImg = preparedImg
  console.log('template img: ', templateData.value.backgroundImg)
}

const prepareImg = (img: Uint8Array) => {
  return 'data:image/png;base64,' + img.toString()
}

const getTemplateData = (template: TemplateTypes) => {
  console.log(template, ' template')
  templateData.value.template = template
  templateData.value.backgroundImg = img.value

  console.log('template: ', templateData)
}

const save = async () => {
  templateData.value.isCompleted = true
  await createTemplate()
}

const createTemplate = async () => {
  console.log('create: ', templateData)
  console.log(templateData.value)
  const { data } = await api.post<CreateTemplateResponse>(
    '/integrations/ccp/certificate/template',
    {
      body: {
        data: {
          relationships: {
            user: userState.setting.Name,
          },
          attributes: {
            template: templateData.value.template,
            background_img: templateData.value.backgroundImg,
            is_completed: templateData.value.isCompleted,
          },
        },
      },
    },
  )
  console.log(data, ' data ')
  img.value = prepareImg(data.background_img)
  templateData.value.backgroundImg = prepareImg(data.background_img)
  if (templateData.value.isCompleted) {
    await router.push(ROUTE_NAMES.main)
  }
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

.template__btns {
  display: flex;
  justify-content: space-between;
}
</style>
