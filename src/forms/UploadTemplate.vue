<!--todo update style-->
<template>
  <p>{{ text }}</p>
  <form class="kyc-form" @submit.prevent="submit">
    <file-field
      @update:model-value="addDocument"
      class="kyc-form__field"
      @blur="touchField('documents')"
      :disabled="isFormDisabled"
    />
    <app-button
      class="kyc-form__actions-btn"
      size="large"
      type="submit"
      text="$t('test')"
      :disabled="isFormDisabled"
    />
    <p>{{ uploadTmp }}</p>
  </form>
</template>

<script setup lang="ts">
import { useForm, useFormValidation } from '@/composables'
import { reactive } from 'vue'
import { required } from '@/validators'
import FileField from '@/fields/FileField.vue'
import AppButton from '@/common/AppButton.vue'

const form = reactive({
  documents: [] as File[],
})

const emit = defineEmits<{
  (e: 'submitted', file: File): string
}>()

const uploadTmp = 'uploadTmp'
const { disableForm, enableForm, isFormDisabled } = useForm()
const { isFormValid } = useFormValidation(form, {
  documents: { required },
})

const text = 'text'
const addDocument = async (value?: File) => {
  if (value) {
    form.documents.push(value)
  }
}
const submit = async () => {
  if (!isFormValid()) return
  disableForm()
  emit('submitted', form.documents[0])
  enableForm()
}
</script>

<style lang="scss" scoped></style>
