<template>
  <div v-if="!isFormValid">
    <error-message message="getFieldErrorMessage('required-all')" />
  </div>
  <div class="template-form">
    <input-field
      class="template-form__input"
      label="High"
      type="text"
      v-model="form.QR.High"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Width"
      type="text"
      v-model="form.QR.Width"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.QR.X"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.QR.Y"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Size"
      type="text"
      v-model="form.Name.Size"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.Name.X"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.Name.Y"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Size"
      type="text"
      v-model="form.Date.Size"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.Date.X"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.Date.Y"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Size"
      type="text"
      v-model="form.Points.Size"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.Points.X"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.Points.Y"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="SerialNumber Size"
      type="text"
      v-model="form.SerialNumber.Size"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="SerialNumber X"
      type="text"
      v-model="form.SerialNumber.X"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="SerialNumber Y"
      type="text"
      v-model="form.SerialNumber.Y"
      @update:model-values="test"
    />

    <input-field
      class="template-form__input"
      label="Level Size"
      type="text"
      v-model="form.Level.Size"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Level X"
      type="text"
      v-model="form.Level.X"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="Level Y"
      type="text"
      v-model="form.Level.Y"
      @update:model-values="test"
    />

    <input-field
      class="template-form__input"
      label="form.field1"
      type="text"
      v-model="form.Note.Size"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="form.field1"
      type="text"
      v-model="form.Note.X"
      @update:model-values="test"
    />
    <input-field
      class="template-form__input"
      label="form.field1"
      type="text"
      v-model="form.Note.Y"
      @update:model-values="test"
    />
  </div>
</template>

<script lang="ts" setup>
import { TemplateTypes, TemplateField } from '@/types'
import { AppButton } from '@/common'
import { InputField } from '@/fields'
import { reactive, ref } from 'vue'
import { useFormValidation } from '@/composables'
import { address, required } from '@/validators'
import ErrorMessage from '@/common/ErrorMessage.vue'

const form = reactive({
  Name: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  Course: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  Date: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  Points: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  Credits: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  Exam: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  Level: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  SerialNumber: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  Note: {
    X: '',
    Y: '',
    Size: '',
    Font: '',
  } as TemplateField,
  QR: {
    X: '',
    Y: '',
    High: '',
    Width: '',
  } as TemplateField,
} as TemplateTypes)

const emit = defineEmits<{
  (e: 'update-template', template: TemplateTypes): boolean
}>()

const { getFieldErrorMessage, isFormValid } = useFormValidation(form, {
  address: { required, address },
})

const test = () => {
  if (!isFormValid) return

  emit('update-template', form)
}
</script>

<style lang="scss" scoped>
.template-form {
  //min-width: toRem(1000);
  display: grid;
  //grid-template-columns: repeat(3, 1fr);
  //gap: toRem(80);
}

.template-form__input {
  //width: 30%;
  padding: toRem(5);
  margin-bottom: toRem(20);
}
</style>
