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

export type TemplatesJSONResponseList = {
  data: TemplateJSONResponse[]
  included: object[]
  links: object
}

export type TemplateJSONResponse = {
  attributes: TemplateJsonItem
}

export type TemplateJsonItem = {
  background_img: string
  template_name: string
}
