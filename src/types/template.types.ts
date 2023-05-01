import { UserTypes } from '@/types/user.types'

export type TemplateTypes = {
  File?: string
  Name?: TemplateField
  Course?: TemplateField
  Credits?: TemplateField
  SerialNumber?: TemplateField
  Date?: TemplateField
  Exam?: TemplateField
  QR?: TemplateField
  Level?: TemplateField
  Note?: TemplateField
  Points?: TemplateField
}

export type TemplateField = {
  X: string
  Y: string
  Size?: string
  Font?: string
  High?: string
  Width?: string
}

export type CreateTemplateResponse = {
  attributes: {
    name: string
    prepared_img: Uint8Array
  }
}
