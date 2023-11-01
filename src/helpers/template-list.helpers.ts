import { TemplateJSONItem } from '@/types'
import { FILES_BASE } from '@/enums'

export const prepareTemplatesImages = (
  templates: TemplateJSONItem[],
): TemplateJSONItem[] => {
  for (const template of templates) {
    if (!template.background_img) {
      template.background_img = ''
      continue
    }
    template.background_img =
      FILES_BASE.PNG_BASE + template.background_img.toString()
  }

  return templates
}
