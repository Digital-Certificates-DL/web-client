<template>
  <div class="template-page">
    <div class="template-page__info">
      <h3>{{ $t('template_page.title') }}</h3>
      <p class="template-page__description">
        {{ $t('template_page.description') }}
      </p>
      <app-button text="send" @click="sendTemplate" />
    </div>
    <div class="template-page__nav">
      <app-button class="template-page__btn" :icon-left="$icons.cursorClick" />
      <app-button
        class="template-page__btn"
        text="+"
        @click="currentInputInfo.font_size++"
      />
      <app-button
        v-if="currentInputInfo.font_size"
        class="template-page__btn"
        :text="currentInputInfo.font_size.toString()"
      />
      <app-button v-else class="template-page__btn" text="15" />
      <app-button
        class="template-page__btn"
        text="-"
        @click="currentInputInfo.font_size--"
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
      @click="currentInputInfo = {} as Template"
    >
      <img
        class="template-page__back-image"
        id="testID"
        src="/static/branding/blockchain.png"
        alt="Uploaded Image"
      />
      <div
        v-for="(position, index) in defaultTemplate"
        :key="index"
        class="template-page__input"
        draggable="true"
        :style="{
          left: position.x_center ? '38%' : position.x + 'px',
          display: 'flex',
          top: position.y + 'px',
        }"
        @mousedown.stop="startDrag(index, $event)"
        @mousemove.stop="drag($event)"
        @mouseup.stop="endDrag"
        @mouseleave.stop="endDrag"
        @click.stop
      >
        <input
          v-model="position.text"
          type="text"
          :style="{
            fontSize: position.font_size + 'px',
            color: position.color || 'white',
            width: 400 + 'px',
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
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AppButton from '@/common/AppButton.vue'
import { Template } from '@/types/template'
import { api } from '@/api'
import { ErrorHandler } from '@/helpers'
import { defineProps } from 'vue/dist/vue'
import { useUserStore } from '@/store'

const textValue = ref('')

const inputField = ref(null)
const currentInputInfo = ref<Template>({} as Template)
const imgInfo = ref<HTMLImageElement>()

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

const defaultTemplate = ref<Template[]>([
  {
    name: 'name',
    text: 'Your full name',
    x_center: true,
    y: 350,
    font_size: 15,
  } as Template,
  {
    name: 'points',
    text: '145/800',
    x: 140,
    y: 158,
    font_size: 15,
  } as Template,
  {
    name: 'serial_number',
    text: '7db1205abadcb4459af2',
    x: 1000,
    y: 112,
    font_size: 15,
  } as Template,
  {
    name: 'date',
    text: 'Issued on: 99.99.9999',
    x: 1000,
    y: 158,
    font_size: 15,
  } as Template,
  {
    name: 'credits',
    text: 'ECTS Credit',
    x: 140,
    y: 112,
    font_size: 15,
  } as Template,
  {
    name: 'exam',
    text: 'Successfully completed',
    x_center: true,
    y: 400,
    font_size: 15,
  } as Template,
  {
    name: 'level',
    text: 'Level: beginner at theoretical aspects',
    x_center: true,
    y: 425,
    font_size: 15,
  } as Template,
  {
    name: 'course',
    text: 'Data bases',
    x_center: true,
    y: 300,
    font_size: 20,
  } as Template,
  {
    name: 'note',
    text: 'Exam passed',
    y: 450,
    x_center: true,
    font_size: 15,
  } as Template,
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

const selectInput = (info: Template) => {
  currentInputInfo.value = info
}

const sendTemplate = async () => {
  try {
    const { data } = await api.post('/integrations/ccp/certificate/template', {
      body: {
        data: {
          attributes: {
            background_img: useUserStore().$state.bufferImg,
            is_completed: true,
            template: await prepareTemplates(),
            template_name: props.name,
          },
          relationships: {
            user: useUserStore().setting.accountName,
          },
        },
      },
    })
    return data
  } catch (err) {
    ErrorHandler.process(err)
  }
}

const getDeltes = async () => {
  await getImageSize()
  const { height, width } = getCurrentImageSize()
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
  }
  clearFieldsMockData()
}

const clearFieldsMockData = () => {
  for (const field of defaultTemplate.value) {
    if (field.name != 'credits') {
      field.text = ''
    }
  }
}

const getCurrentImageSize = () => {
  const test = document.getElementById('testID')
  /* eslint-disable no-console */
  console.log(test)
  if (test) {
    console.log(test.getClientRects())
    console.log(test.getClientRects().length)
    console.log(test.getClientRects()[0])
  }
  return {
    width: test.getClientRects()[0].width,
    height: test.getClientRects()[0].height,
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
    img.src = useUserStore().$state.bufferImg
  })
}

const prepareTemplates = async () => {
  await calculateTemplatePositions()
  const template = {
    high: imgInfo.value?.naturalHeight,
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
  }
  return template
}
const getInputByName = (name: string) => {
  return defaultTemplate.value.filter(data => {
    return data.name === name
  })[0]
}

const changeXCentrilize = () => {
  currentInputInfo.value.x_center = !currentInputInfo.value.x_center
}
</script>

<style scoped lang="scss">
.template-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-page__back-image-wrp {
  position: relative;
  max-width: toRem(1300);
}

.template-page__back-image {
  position: relative;
  margin: auto;
  width: 100%;
}

.template-page__input {
  position: absolute;
}

.template-page__input input {
  width: toRem(200);
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
  display: flex;
  align-items: center;
}

.template-page__remove-field-btn {
  background: #000a12;
  color: var(--white);
  opacity: 9;
}
</style>
