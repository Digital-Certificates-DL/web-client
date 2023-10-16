import { TemplateType } from '@/types'
import { TEMPLATE_FIELD_ENUM } from '@/enums'

export const DefaultTemplate = [
  {
    name: TEMPLATE_FIELD_ENUM.name,
    text: 'Your full name',
    x_center: true,
    y: 350,
    x: 0,
    font_size: 15,
  } as TemplateType,
  {
    name: TEMPLATE_FIELD_ENUM.points,
    text: '145/800',
    x: 140,
    y: 158,
    font_size: 15,
  } as TemplateType,
  {
    name: TEMPLATE_FIELD_ENUM.serial_number,
    text: '7db1205abadcb4459af2',
    x: 900,
    y: 112,
    font_size: 15,
  } as TemplateType,
  {
    name: TEMPLATE_FIELD_ENUM.date,
    text: 'Issued on: 99.99.9999',
    x: 900,
    y: 158,
    font_size: 15,
  } as TemplateType,
  {
    name: TEMPLATE_FIELD_ENUM.credits,
    text: 'ECTS Credit',
    x: 140,
    y: 112,
    font_size: 15,
  } as TemplateType,
  {
    name: TEMPLATE_FIELD_ENUM.exam,
    text: 'Exam passed',
    x_center: true,
    y: 400,
    x: 0,
    font_size: 15,
  } as TemplateType,
  {
    name: TEMPLATE_FIELD_ENUM.level,
    text: 'Level: beginner at theoretical aspects',
    x_center: true,
    y: 425,
    x: 0,
    font_size: 15,
  } as TemplateType,
  {
    name: TEMPLATE_FIELD_ENUM.course,
    text: 'Data bases',
    x_center: true,
    y: 300,
    x: 0,
    font_size: 20,
  } as TemplateType,
  {
    font_size: 0,
    name: TEMPLATE_FIELD_ENUM.qr,
    y: 250,
    x: 900,
    is_qr: true,
    width: 200,
    height: 200,
  } as TemplateType,
]
