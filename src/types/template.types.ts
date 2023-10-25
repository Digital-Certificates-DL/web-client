export type TemplateType = {
  name: string
  text: string
  x: number
  y: number
  x_center: boolean
  y_center: boolean
  color: string
  font_size: number
  is_qr: boolean
  width: number
  height: number
}

export type DragDataType = {
  active: boolean
  index: number | null
  startX: number
  startY: number
}

export type TemplateJSONItem = {
  background_img: string
  template_name: string
}

export type SavedTemplate = {
  height: number
  width: number
  name: TemplateType
  course: TemplateType
  credits: TemplateType
  points: TemplateType
  serial_number: TemplateType
  date: TemplateType
  exam: TemplateType
  level: TemplateType
  qr: TemplateType
}
