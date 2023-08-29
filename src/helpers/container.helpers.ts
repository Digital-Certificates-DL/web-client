import { ValidateContainerStateAPICall } from '@/api/api'
import { cleanCertificate } from '@/helpers/certificate-list.helpers'

export const validateContainerState = async (containerID: string) => {
  const data = await ValidateContainerStateAPICall(containerID)
  if (!data) {
    throw new Error()
  }
  data.clear_certificate = cleanCertificate(data.certificates)
  return data
}
