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
      <app-button><img src="/static/branding/cursor.png" alt="" /></app-button>
      <app-button text="+" @click="currentInputInfo.fontSize++" />
      <app-button
        v-if="currentInputInfo.fontSize"
        :text="currentInputInfo.fontSize.toString()"
      />
      <app-button v-else text="15" />
      <app-button text="-" @click="currentInputInfo.fontSize--" />
      <input type="color" v-model="currentInputInfo.color" />
    </div>
    <div
      class="template-page__back-image"
      @click="currentInputInfo = {} as Template"
    >
      <img
        class="template-page__template-background"
        id="testID"
        src="/static/branding/blockchain.png"
        alt="Uploaded Image"
      />
      <div
        v-for="(position, index) in defaultTemplate"
        :key="index"
        class="template-page__input"
        :style="{
          left: position.xCenter ? '38%' : position.x + 'px',
          display: 'flex',
          top: position.y + 'px',
        }"
        draggable="true"
        @mousedown.stop="startDrag(index, $event)"
        @mousemove.stop="drag($event)"
        @mouseup.stop="endDrag"
        @mouseleave.stop="endDrag"
        @click.stop
      >
        <input
          type="text"
          :style="{
            fontSize: position.fontSize + 'px',
            color: position.color || 'white',
            width: 400 + 'px',
            'text-align': position.xCenter ? 'center' : 'left',
          }"
          v-model="position.text"
          @focus="inputField = $event.target"
          @click.stop="selectInput(position)"
        />

        <button @click.stop="removeInput(index)">
          {{ $t('template-page.remove-input-btn') }}
        </button>
      </div>
    </div>
    <app-button @click.stop="saveTextPosition">
      {{ $t('template-page.save-position') }}
    </app-button>
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
const textPositionSaved = ref(false)
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
    name: 'Participent',
    text: 'Your full name',
    xCenter: true,
    y: 434,
    fontSize: 15,
  } as Template,
  {
    name: 'Points',
    text: '145/800',
    x: 140,
    y: 158,
    fontSize: 15,
  } as Template,
  {
    name: 'SerialNumber',
    text: '7db1205abadcb4459af2',
    x: 1144,
    y: 112,
    fontSize: 15,
  } as Template,
  {
    name: 'Date',
    text: 'Issued on: 99.99.9999',
    x: 1282,
    y: 158,
    fontSize: 15,
  } as Template,
  {
    name: 'Credits',
    text: 'ECTS Credit',
    x: 140,
    y: 112,
    fontSize: 15,
  } as Template,
  {
    name: 'Successfully completed',
    text: 'Successfully completed',
    xCenter: true,
    y: 580,
    fontSize: 15,
  } as Template,
  {
    name: 'Level',
    text: 'Level: beginner at theoretical aspects',
    xCenter: true,
    y: 554,
    fontSize: 15,
  } as Template,
  {
    name: 'Note',
    text: 'Exam passed',
    y: 600,
    xCenter: true,
    fontSize: 15,
  } as Template,
])

const removeInput = (index: number) => {
  defaultTemplate.value.splice(index, 1)
  clearInput()
}

const clearInput = () => {
  textValue.value = ''
}

const saveTextPosition = () => {
  console.log('positions:', defaultTemplate.value)
  textPositionSaved.value = true
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
            is_compiled: true,
            template: await prepareTemplates(),
            template_name: props.name,
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
  await getCurrentImageSize()
  const deltaHeight = imgInfo.value!.naturalHeight! / imgInfo.value!.height!
  const deltaWidth = imgInfo.value!.naturalWidth! / imgInfo.value!.width!
  return { deltaHeight, deltaWidth }
}

const prepareTemplates = async () => {
  const { deltaHeight, deltaWidth } = await getDeltes()
  for (const field of defaultTemplate.value) {
    field.x *= deltaWidth
    field.y *= deltaHeight
    field.fontSize = deltaHeight
  }
  clearFieldsMockData()
  return defaultTemplate.value
}

const clearFieldsMockData = () => {
  for (const field of defaultTemplate.value) {
    if (field.name != 'Credits') {
      field.text = ''
    }
  }
}

const getCurrentImageSize = () => {
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
</script>

<style scoped lang="scss">
.template-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-page__back-image {
  position: relative;
  margin-bottom: toRem(20);
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
}
</style>
