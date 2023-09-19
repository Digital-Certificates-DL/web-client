import { validateContainerState } from '@/api/api'
import { cleanCertificate } from '@/helpers/certificate-list.helpers'
import { errors } from '@/errors'

export const validateContainerStateWrapper = async (containerID: string) => {
  const data = await validateContainerState(containerID)
  if (!data) {
    throw errors.EmptyContainerError
  }
  data.clear_certificate = cleanCertificate(data.certificates)
  return data
}
