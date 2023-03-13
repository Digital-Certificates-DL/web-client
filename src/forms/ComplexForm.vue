<template>
  <div class="complex-form">
    <p>{{ text }}</p>
    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="data.QR.High"
      placeholder="image size H"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.QR.Width"
      placeholder="image size W"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.QR.X"
      placeholder="image position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.QR.Y"
      placeholder="image position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Name.Size"
      placeholder="name font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Name.X"
      placeholder="name position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Name.Y"
      placeholder="name position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Date.Size"
      placeholder="date font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Date.X"
      placeholder="date position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Date.Y"
      placeholder="date position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Points.Size"
      placeholder="mark font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Points.X"
      placeholder="mark position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Points.Y"
      placeholder="mark position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="data.SerialNumber.Size"
      placeholder="serial number font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.SerialNumber.X"
      placeholder="serial numbe position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.SerialNumber.Y"
      placeholder="serial numbe position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Level.Size"
      placeholder="level font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Level.X"
      placeholder="level position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Level.Y"
      placeholder="level position(y)"
    />

    <label for=""></label>
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Note.Size"
      placeholder="note font size"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Note.X"
      placeholder="note position(x)"
    />
    <input-field
      label="form.field1"
      type="text"
      v-model="data.Note.Y"
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
import { TemplateTypes } from '@/types'
import { AppButton } from '@/common'
import { InputField } from '@/fields'

const data = {} as TemplateTypes
const emit = defineEmits<{
  (e: 'submitted', file: TemplateTypes): void
}>()

const text = 'ewrewrew'
const createTemplate = () => {
  emit('submitted', data)
}
</script>

<style lang="scss" scoped></style>
