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
  //todo update
}

export type TemplateField = {
  X: string
  Y: string
  Size?: string
  Font?: string
  High?: string
  Width?: string
}
