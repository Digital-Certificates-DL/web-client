<template-types>
  <div class="template-page">
    <div class="template-page__info">
      <h3>{{ $t('template-page.title') }}</h3>
      <p class="template-page__description">
        {{ $t('template-page.description') }}
      </p>
    </div>
    <div class="template-page__nav">
      <app-button text="send" @click="sendTemplate" />
      <app-button class="template-page__btn" text="+" @click="makeBigger()" />

      <app-button class="template-page__btn" :disabled="currentInputInfo.is_qr">
        {{ currentInputInfo.font_size || '0' }}
      </app-button>
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
      <input v-model="currentInputInfo.color" type="color" />
    </div>
    <div
      class="template-page__back-image-wrp"
      @click="currentInputInfo = {} as TemplateTypes"
    >
      <img
        class="template-page__back-image"
        id="certificate-background"
        :src="userStore.bufferImg || '/static/branding/blockchain.png'"
        alt="Uploaded Image"
      />

      <div
        v-for="(position, index) in defaultTemplate"
        :key="index"
        class="template-page__input"
        draggable="true"
        :style="{
          left: position.x_center ? '42%' : position.x + 'px',
          display: 'flex',
          top: position.y + 'px',
        }"
        @mousedown.stop="startDrag(index, $event)"
        @mousemove.stop="drag($event)"
        @mouseup.stop="endDrag"
        @mouseleave.stop="endDrag"
        @click.stop
      >
        <div
          v-if="position.is_qr"
          class="template-page__qr-default-style"
          :style="{
            width: position.width + 'px',
            height: position.height + 'px',
          }"
          @focus="inputField = $event.target"
          @click.stop="selectInput(position)"
        ></div>

        <input
          v-if="!position.is_qr"
          v-model="position.text"
          type="text"
          :style="{
            fontSize: position.font_size + 'px',
            color: position.color || 'white',
            width: 200 + 'px',
            'text-align': position.x_center ? 'center' : 'left',
          }"
          @focus="inputField = $event.target"
          @click.stop="selectInput(position)"
        />

        <app-button
          class="template-page__remove-field-btn"
          :icon-left="$icons.x"
          @click.stop="removeInput(index)"
        >
        </app-button>
      </div>
    </div>

    <success-modal
      :is-shown="isSuccessModalShown"
      :transaction="$t('template-page.success-msg')"
    />
    <loader-modal v-model:is-shown="isLoading" v-model:text="$t('template-page.loader-text')" />
  </div>
</template-types>

<script lang="ts" setup>
import { ref, defineProps } from 'vue'
import { TemplateTypes } from '@/types'
import { saveTemplate } from '@/api'
import { ErrorHandler } from '@/helpers'
import { useUserStore } from '@/store'
import { LoaderModal, AppButton, SuccessModal } from '@/common'

const userStore = useUserStore()

const isLoading = ref(false)
const textValue = ref('')
const inputField = ref(null)
const currentInputInfo = ref<TemplateTypes>({} as TemplateTypes)
const imgInfo = ref<HTMLImageElement>()
const isSuccessModalShown = ref(false)
const props = defineProps<{
  name: string
}>()

interface DragData {
  active: boolean
  index: number | null
  startX: number
  startY: number
}

const dragData = ref({
  active: false,
  index: null,
  startX: 0,
  startY: 0,
} as DragData)

const defaultTemplate = ref<TemplateTypes[]>([
  {
    name: 'name',
    text: 'Your full name',
    x_center: true,
    y: 350,
    x: 0,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'points',
    text: '145/800',
    x: 140,
    y: 158,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'serial_number',
    text: '7db1205abadcb4459af2',
    x: 1000,
    y: 112,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'date',
    text: 'Issued on: 99.99.9999',
    x: 1000,
    y: 158,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'credits',
    text: 'ECTS Credit',
    x: 140,
    y: 112,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'exam',
    text: 'Successfully completed',
    x_center: true,
    y: 400,
    x: 0,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'level',
    text: 'Level: beginner at theoretical aspects',
    x_center: true,
    y: 425,
    x: 0,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'course',
    text: 'Data bases',
    x_center: true,
    y: 300,
    x: 0,
    font_size: 20,
  } as TemplateTypes,
  {
    name: 'note',
    text: 'Exam passed',
    y: 450,
    x: 0,
    x_center: true,
    font_size: 15,
  } as TemplateTypes,
  {
    font_size: 0,
    name: 'qr',
    y: 100,
    x: 900,
    is_qr: true,
    width: 200,
    height: 200,
  } as TemplateTypes,
])

const removeInput = (index: number) => {
  defaultTemplate.value.splice(index, 1)
  clearInput()
}

const clearInput = () => {
  textValue.value = ''
}

const startDrag = (index: number, event: MouseEvent) => {
  dragData.value.active = true
  dragData.value.index = index
  dragData.value.startX = event.clientX
  dragData.value.startY = event.clientY
}

const drag = (event: MouseEvent) => {
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

const endDrag = () => {
  dragData.value.active = false
  dragData.value.index = null
}

const selectInput = (info: TemplateTypes) => {
  currentInputInfo.value = info
}

const sendTemplate = async () => {
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
}

const getDeltes = async () => {
  await getImageSize()
  const { height, width } = getCurrentImageSize()
  if (!height || !width) {
    throw new Error()
  }
  const deltaHeight = imgInfo.value!.naturalHeight! / height
  const deltaWidth = imgInfo.value!.naturalWidth! / width
  return { deltaHeight, deltaWidth }
}

const calculateTemplatePositions = async () => {
  const { deltaHeight, deltaWidth } = await getDeltes()
  for (const field of defaultTemplate.value) {
    field.x *= deltaWidth
    field.y *= deltaHeight
    field.font_size *= deltaHeight

    field.x = Math.round(field.x)
    field.y = Math.round(field.y)
    field.font_size = Math.round(field.font_size)

    if (field.name === 'qr') {
      field.height *= deltaHeight
      field.width *= deltaWidth
      field.width = Math.round(field.width)
      field.height = Math.round(field.height)
    }
  }
  clearFieldsMockData()
}

const clearFieldsMockData = () => {
  for (const field of defaultTemplate.value) {
    if (field.name != 'credits' && field.name != 'course') {
      field.text = ''
    }
  }
}

const getCurrentImageSize = () => {
  const certificateBackground = document.getElementById(
    'certificate-background',
  )
  if (!certificateBackground) {
    throw new Error()
  }
  return {
    width: certificateBackground?.getClientRects()[0].width,
    height: certificateBackground?.getClientRects()[0].height,
  }
}

const getImageSize = async () => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = function () {
      imgInfo.value = img
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = function () {
      reject(new Error('Failed to load the image.'))
    }
    img.src = useUserStore().bufferImg
  })
}

const prepareTemplates = async () => {
  await calculateTemplatePositions()
  return {
    height: imgInfo.value?.naturalHeight,
    width: imgInfo.value?.naturalWidth,
    name: getInputByName('name'),
    course: getInputByName('course'),
    credits: getInputByName('credits'),
    points: getInputByName('points'),
    serial_number: getInputByName('serial_number'),
    date: getInputByName('date'),
    exam: getInputByName('exam'),
    level: getInputByName('level'),
    note: getInputByName('note'),
    qr: getInputByName('qr'),
  }
}
const getInputByName = (name: string) => {
  return defaultTemplate.value.filter(data => {
    return data.name === name
  })[0]
}

const makeBigger = () => {
  if (!currentInputInfo.value.is_qr) {
    currentInputInfo.value.font_size++
    return
  }
  currentInputInfo.value.width += 5
  currentInputInfo.value.height += 5
}
const makeSmaller = () => {
  if (!currentInputInfo.value.is_qr) {
    currentInputInfo.value.font_size--
    return
  }
  currentInputInfo.value.width -= 5
  currentInputInfo.value.height -= 5
}

const changeXCentrilize = () => {
  currentInputInfo.value.x_center = !currentInputInfo.value.x_center
}
</script>

<style scoped lang="scss">
.template-page {
  width: 100%;
  margin: 0 auto;
}

.template-page__back-image-wrp {
  position: relative;
  width: 80vw;
  margin: auto 0;
}

.template-page__back-image {
  width: 100%;
  height: 100%;
}

.template-page__input {
  position: absolute;
}

.template-page__input input {
  max-width: toRem(200);
  width: 100%;
  background: rgba(0, 0, 0, 0);
  border: none;

  &:focus {
    border: #5cc56e toRem(1) solid;
  }
}

.template-page__description {
  width: toRem(600);
}

.template-page__info {
  width: var(--page-large);
  display: grid;
  justify-content: left;
}

.template-page__nav {
  width: 70vw;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: space-evenly;
  height: toRem(40);
  margin: toRem(40) 0;
}

.template-page__remove-field-btn {
  background: #000a12;
  color: var(--white);
  opacity: 9;
}

.template-page__btn {
  height: toRem(50);
  width: toRem(50);
  font-size: toRem(18);
  text-align: center;
}

.template-page__qr-default-style {
  background: red;
}
</style>
