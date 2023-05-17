export type TemplateTypes = {
  file: string
  width: number
  high: number
  name: TemplateField
  course: TemplateField
  credits: TemplateField
  serial_number: TemplateField
  date: TemplateField
  exam: TemplateField
  qr: TemplateField
  level: TemplateField
  note: TemplateField
  points: TemplateField
}

export type TemplateField = {
  x?: number
  y?: number
  size?: number
  font?: string
  high?: number
  width?: number
}

export type CreateTemplateResponse = {
  attributes: {
    name: string
    background_img: Uint8Array
  }
}

export type TemplateRequestData = {
  template: TemplateTypes
  backgroundImg: string
  isCompleted: boolean
}
