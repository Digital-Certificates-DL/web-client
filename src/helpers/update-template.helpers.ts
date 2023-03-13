import { api } from '@/api'

import { TemplateTypes } from '@/types'

export const updateTemplate = async (template: TemplateTypes) => {
  const { data } = await api.post<{ message: string }>(
    '/integrations/css/template',
    {
      data: template,
    },
  )

  /**
   * we are using split('\n')... instead of just authNonce message
   * because authNonce has format of
   * 'user-friendly part'\n'message we need'
   * so we have to use split to take that last part
   * with message for signing
   */
  return data
}
