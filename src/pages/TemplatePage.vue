<template>
  <div class="template-page">
    <div class="template-page__info">
      <h2 class="template-page__title">
        {{ $t('template-page.title') }}
      </h2>
      <div class="template-page__description">
        <p class="template-page__description-text">
          {{ $t('template-page.description') }}
        </p>
        <div class="template-page__nav-btns">
          <app-button
            color="info"
            :text="$t('template-page.save-btn-text')"
            @click="sendTemplate"
          />
          <app-button
            :text="$t('template-page.cancel-btn-text')"
            :route="{
              name: $routes.main,
            }"
          />
        </div>
      </div>
    </div>
    <div class="template-page__tool-btns">
      <input v-model="currentInputInfo.color" type="color" />

      <app-button class="template-page__btn" text="+" @click="makeBigger()" />

      <app-button
        class="template-page__btn"
        :disabled="currentInputInfo.is_qr"
        :text="currentInputInfo.font_size.toString() || '0'"
      />
      <app-button
        class="template-page__btn"
        size="large"
        text="-"
        @click="makeSmaller()"
      />
      <app-button
        class="template-page__btn"
        :icon-left="$icons.viewList"
        @click="changeXCentrilize"
      />
    </div>
    <div
      class="template-page__back-image-wrp"
      @click="currentInputInfo = {} as TemplateType"
    >
      <img
        class="template-page__back-image"
        :ref="certificateBackground"
        :src="userStore.bufferImg || '/branding/blockchain.png'"
        :alt="$t('template-page.template-img-alt')"
      />

      <div
        v-for="(position, index) in defaultTemplate"
        class="template-page__input-wrp"
        draggable
        :key="index"
        :style="{
          left: position.x_center ? '52%' : position.x * windowSizeCoef + 'px',
          top: position.y * windowSizeCoef + 'px',
          transform: position.x_center ? 'translate(-50%, 0)' : 'none',
        }"
        @mousedown.stop="startDragInput(index, $event)"
        @mousemove.stop="dragInput($event)"
        @mouseup.stop="endDragInput"
        @mouseleave.stop="endDragInput"
        @click.stop
      >
        <div
          v-if="position.is_qr"
          class="template-page__qr-default-style"
          :style="{
            width: position.width * windowSizeCoef + 'px',
            height: position.height * windowSizeCoef + 'px',
          }"
          @focus="inputField = $event.target"
          @click.stop="selectInput(position)"
        ></div>

        <input
          v-if="!position.is_qr"
          v-model="position.text"
          class="template-page__input"
          type="text"
          :style="{
            fontSize: position.font_size + 'px',
            color: position.color || 'white',
            width: position.font_size * position.text.length * 0.55 + 'px',
            'text-align': position.x_center ? 'center' : 'left',
          }"
          @focus="inputField = $event.target"
          @click.stop="selectInput(position)"
        />

        <app-button
          class="template-page__remove-field-btn"
          :icon-left="$icons.x"
          @click.stop="removeInput(index)"
        />
      </div>
    </div>

    <success-modal
      :is-shown="isSuccessModalShown"
      :description="$t('template-page.success-description')"
      :transaction="$t('template-page.success-msg')"
    />
    <loader-modal
      v-model:is-shown="isLoading"
      :text="$t('template-page.loader-text')"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, watch } from 'vue'
import { TemplateType, DragDataType, SavedTemplate } from '@/types'
import { saveTemplate } from '@/api'
import { ErrorHandler } from '@/helpers'
import { useUserStore } from '@/store'
import { LoaderModal, AppButton, SuccessModal } from '@/common'
import { useWindowSize } from '@vueuse/core'
import { TEMPLATE_FIELD_ENUM } from '@/enums'
import { DefaultTemplate } from '@/constant'
import _ from 'lodash'
import { errors } from '@/errors'

const props = defineProps<{
  name: string
}>()

const DELTA_QR_SIZE = 5

const userStore = useUserStore()
const { width } = useWindowSize()

const isLoading = ref(false)
const textValue = ref('')
const inputField = ref(null)
const currentInputInfo = ref<TemplateType>({} as TemplateType)
const imgInfo = ref<HTMLImageElement>()
const isSuccessModalShown = ref(false)
const windowSizeCoef = ref(1)

const dragData = ref({
  active: false,
  index: null,
  startX: 0,
  startY: 0,
} as DragDataType)

const certificateBackground = ref<HTMLElement | null>({} as HTMLElement)
const defaultTemplate = ref<TemplateType[]>(DefaultTemplate)

const removeInput = (index: number) => {
  defaultTemplate.value.splice(index, 1)
  clearInput()
}

const clearInput = () => {
  textValue.value = ''
}

const startDragInput = (index: number, event: MouseEvent) => {
  dragData.value.active = true
  dragData.value.index = index
  dragData.value.startX = event.clientX
  dragData.value.startY = event.clientY
}

const dragInput = (event: MouseEvent) => {
  if (dragData.value.active) {
    const dx = event.clientX - dragData.value.startX
    const dy = event.clientY - dragData.value.startY
    const position = defaultTemplate.value[dragData.value.index!]
    position.x += dx
    position.y += dy
    dragData.value.startX = event.clientX
    dragData.value.startY = event.clientY
  }
}

const endDragInput = () => {
  dragData.value.active = false
  dragData.value.index = null
}

const selectInput = (info: TemplateType) => {
  currentInputInfo.value = info
}

const sendTemplate = async () => {
  isLoading.value = true

  try {
    const template = await prepareTemplates()
    await saveTemplate(
      useUserStore().bufferImg,
      template,
      props.name,
      useUserStore().userSetting.accountName,
    )
    isSuccessModalShown.value = true
  } catch (err) {
    ErrorHandler.process(err)
  }
  isLoading.value = false
}

const getDeltas = async () => {
  const { height, width } = getCurrentImageSize()
  if (!height || !width) {
    throw errors.FailedGetImageSize
  }

  const deltaHeight = imgInfo.value!.naturalHeight! / height
  const deltaWidth = imgInfo.value!.naturalWidth! / width
  return { deltaHeight, deltaWidth }
}

const calculateTemplatePositions = async (template: TemplateType[]) => {
  const { deltaHeight, deltaWidth } = await getDeltas()
  for (const field of template) {
    field.x *= deltaWidth
    field.y *= deltaHeight
    field.font_size *= deltaHeight

    field.x = Math.round(field.x)
    field.y = Math.round(field.y)
    field.font_size = Math.round(field.font_size)

    if (field.name === TEMPLATE_FIELD_ENUM.qr) {
      field.height *= deltaHeight
      field.width *= deltaWidth
      field.width = Math.round(field.width)
      field.height = Math.round(field.height)
    }
  }
  return clearFieldsMockData(template)
}

const clearFieldsMockData = (template: TemplateType[]) => {
  for (const field of template) {
    if (
      field.name != TEMPLATE_FIELD_ENUM.credits &&
      field.name != TEMPLATE_FIELD_ENUM.course &&
      field.name != TEMPLATE_FIELD_ENUM.level
    ) {
      field.text = ''
    }
  }
  return template
}

const getCurrentImageSize = () => {
  return {
    width: certificateBackground.value?.getClientRects()[0].width,
    height: certificateBackground.value?.getClientRects()[0].height,
  }
}

const prepareTemplates = async () => {
  const template = await calculateTemplatePositions(
    _.cloneDeep(defaultTemplate.value),
  )
  return {
    height: imgInfo.value?.naturalHeight,
    width: imgInfo.value?.naturalWidth,
    name: getInputByName(template, TEMPLATE_FIELD_ENUM.name),
    course: getInputByName(template, TEMPLATE_FIELD_ENUM.course),
    credits: getInputByName(template, TEMPLATE_FIELD_ENUM.credits),
    points: getInputByName(template, TEMPLATE_FIELD_ENUM.points),
    serial_number: getInputByName(template, TEMPLATE_FIELD_ENUM.serial_number),
    date: getInputByName(template, TEMPLATE_FIELD_ENUM.date),
    exam: getInputByName(template, TEMPLATE_FIELD_ENUM.exam),
    level: getInputByName(template, TEMPLATE_FIELD_ENUM.level),
    qr: getInputByName(template, TEMPLATE_FIELD_ENUM.qr),
  } as SavedTemplate
}
const getInputByName = (template: TemplateType[], name: string) => {
  return template.filter(data => {
    return data.name === name
  })[0]
}

const makeBigger = () => {
  if (!currentInputInfo.value.is_qr) {
    currentInputInfo.value.font_size++
    return
  }
  currentInputInfo.value.width += DELTA_QR_SIZE
  currentInputInfo.value.height += DELTA_QR_SIZE
}
const makeSmaller = () => {
  if (!currentInputInfo.value.is_qr) {
    currentInputInfo.value.font_size--
    return
  }
  currentInputInfo.value.width -= DELTA_QR_SIZE
  currentInputInfo.value.height -= DELTA_QR_SIZE
}

const changeXCentrilize = () => {
  currentInputInfo.value.x_center = !currentInputInfo.value.x_center
}

const updateFieldsPassions = () => {
  for (const field of defaultTemplate.value) {
    field.y *= windowSizeCoef.value
    field.x *= windowSizeCoef.value
    field.width *= windowSizeCoef.value
    field.height *= windowSizeCoef.value
  }
}

watch(width, (oldVal, newVal) => {
  windowSizeCoef.value = oldVal / newVal
  updateFieldsPassions()
})
</script>

<style scoped lang="scss">
.template-page {
  max-width: var(--page-large);
  width: 100%;
  margin: 0 auto;
}

.template-page__back-image-wrp {
  position: relative;
  margin: auto 0;
  width: 100%;
}

.template-page__back-image {
  width: 100%;
}

.template-page__input-wrp {
  display: flex;
  position: absolute;
  margin: auto;
}

.template-page__input {
  min-width: toRem(200);
  max-width: toRem(800);
  background: var(--white);
  border: none;

  &:focus {
    border: var(--tertiary-main) toRem(1) solid;
  }
}

.template-page__title {
  margin: toRem(10) 0;
}

.template-page__description {
  display: grid;
  grid-template-columns: 6fr 1fr;
  align-items: center;
}

.template-page__description-text {
  max-width: toRem(600);
  width: 100%;
}

.template-page__info {
  display: grid;
  justify-content: left;
}

.template-page__nav-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: toRem(40);
}

.template-page__tool-btns {
  display: flex;
  align-items: center;
  text-align: center;
  height: toRem(40);
  margin: toRem(40) 0;
}

.template-page__remove-field-btn {
  background: var(--black);
  color: var(--white);
  opacity: 0.6;
}

.template-page__btn {
  height: toRem(50);
  width: toRem(50);
  font-size: toRem(18);
  text-align: center;
  margin: 0 toRem(20);
}

.template-page__qr-default-style {
  background: var(--qr-template-color);
}
</style>
