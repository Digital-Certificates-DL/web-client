<template>
  <div class="complex-form">
    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.QR?.High"
      placeholder="image size H"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.QR?.Width"
      placeholder="image size W"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.QR?.X"
      placeholder="image position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.QR?.Y"
      placeholder="image position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Name?.Size"
      placeholder="name font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Name?.X"
      placeholder="name position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Name?.Y"
      placeholder="name position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Date?.Size"
      placeholder="date font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Date?.X"
      placeholder="date position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Date?.Y"
      placeholder="date position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Points?.Size"
      placeholder="mark font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Points?.X"
      placeholder="mark position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Points?.Y"
      placeholder="mark position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.SerialNumber?.Size"
      placeholder="serial number font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.SerialNumber?.X"
      placeholder="serial numbe position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.SerialNumber?.Y"
      placeholder="serial numbe position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Level?.Size"
      placeholder="level font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Level?.X"
      placeholder="level position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Level?.Y"
      placeholder="level position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Note?.Size"
      placeholder="note font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Note?.X"
      placeholder="note position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="form.Note?.Y"
      placeholder="note position(y)"
    />

    <div class="complex-form__actions">
      <app-button
        class="complex-form__submit-btn"
        type="submit"
        text="Submit"
        @click="createTemplate"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TemplateTypes, TemplateField } from '@/types'
import { AppButton } from '@/common'
import { InputField } from '@/fields'
import { reactive } from 'vue'

// const data = {} as TemplateTypes
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
  (e: 'submitted', file: TemplateTypes): void
}>()

const createTemplate = () => {
  emit('submitted', form)
}
</script>

<style lang="scss" scoped></style>
