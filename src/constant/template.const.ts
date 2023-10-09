import { TemplateTypes } from '@/types'

export const DefaultTemplate = [
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
    x: 900,
    y: 112,
    font_size: 15,
  } as TemplateTypes,
  {
    name: 'date',
    text: 'Issued on: 99.99.9999',
    x: 900,
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
    y: 250,
    x: 900,
    is_qr: true,
    width: 200,
    height: 200,
  } as TemplateTypes,
]
