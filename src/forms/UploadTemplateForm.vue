<template>
  <form class="upload-template-form">
    <input-field
      v-model="form.name"
      class="upload-template-form__name-input"
      :label="$t('upload-template-form.course-name-field')"
      :error-message="getFieldErrorMessage('name')"
    />
    <file-drop-area
      :files-type="IMAGE_FORMAT"
      :icon="$icons.template"
      :is-disabled="!isFormValid()"
      :description="$t('upload-template-form.description')"
      @files-uploaded="onFileUpload"
    />
  </form>
</template>

<script setup lang="ts">
import { InputField } from '@/fields'
import { reactive } from 'vue'
import { FileDropArea } from '@/common'
import { useForm, useFormValidation } from '@/composables'
import { required } from '@/validators'
import { ROUTE_NAMES } from '@/enums'
import { useRouter } from '@/router'
import { useUserStore } from '@/store'
import { ErrorHandler } from '@/helpers'
import { useI18n } from 'vue-i18n'
import { IMAGE_FORMAT } from '@/constant'

const { t } = useI18n()
const router = useRouter()
const { disableForm, enableForm } = useForm()

const emit = defineEmits<{
  (e: 'close-modal'): boolean
}>()

const form = reactive({
  name: t('upload-template-form.course-name-field'),
})

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  name: { required },
})

const onFileUpload = (files: File[]) => {
  parseImages(files)
  if (isFormValid()) {
    sendTemplate()
  }
}

const sendTemplate = () => {
  disableForm()
  emit('close-modal')
  router.push({
    name: ROUTE_NAMES.template,
    params: { name: form.name },
  })
  enableForm()
}

const parseImages = async (fileList: File[]) => {
  if (!fileList) {
    ErrorHandler.process(t('errors.error-empty-list'))
    return
  }
  const file = fileList[0]

  if (!file) {
    ErrorHandler.process(t('errors.error-empty-file'))
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = function async() {
    useUserStore().setBufferImage(reader.result as string)
  }
  reader.onerror = function (error) {
    ErrorHandler.process(error)
    return
  }
}
</script>

<style scoped lang="scss">
.upload-template-form__name-input {
  margin: toRem(10) auto;
}
</style>
