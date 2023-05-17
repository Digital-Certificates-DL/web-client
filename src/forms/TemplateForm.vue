<template>
  <!--  <div v-if="!isFormValid">-->
  <!--    <error-message message="getFieldErrorMessage('required-all')" />-->
  <!--  </div>-->
  <div class="template-form">
    <input-field
      class="template-form__input"
      label="High"
      type="text"
      v-model="form.high"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Width"
      type="text"
      v-model="form.width"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.qr.x"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.qr.y"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Size"
      type="text"
      v-model="form.name.size"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.name.x"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.name.y"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Size"
      type="text"
      v-model="form.date.size"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.date.x"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.date.y"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Size"
      type="text"
      v-model="form.points.size"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="X"
      type="text"
      v-model="form.points.x"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Y"
      type="text"
      v-model="form.points.y"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="SerialNumber Size"
      type="text"
      v-model="form.serial_number.size"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="SerialNumber X"
      type="text"
      v-model="form.serial_number.x"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="SerialNumber Y"
      type="text"
      v-model="form.serial_number.y"
      @input="test"
    />

    <input-field
      class="template-form__input"
      label="Level Size"
      type="text"
      v-model="form.level.size"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Level X"
      type="text"
      v-model="form.level.x"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="Level Y"
      type="text"
      v-model="form.level.y"
      @input="test"
    />

    <input-field
      class="template-form__input"
      label="form.field1"
      type="text"
      v-model="form.note.size"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="form.field1"
      type="text"
      v-model="form.note.x"
      @input="test"
    />
    <input-field
      class="template-form__input"
      label="form.field1"
      type="text"
      v-model="form.note.y"
      @input="test"
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
  high: '' as unknown as number,
  width: '' as unknown as number,
  name: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  course: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  date: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  points: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  credits: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  exam: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  level: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  serial_number: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  note: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
  qr: {
    x: '' as unknown as number,
    y: '' as unknown as number,
    size: '' as unknown as number,
    font: '',
  } as TemplateField,
} as TemplateTypes)

const emit = defineEmits<{
  (e: 'update-template', template: TemplateTypes): boolean
}>()

const test = () => {
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
