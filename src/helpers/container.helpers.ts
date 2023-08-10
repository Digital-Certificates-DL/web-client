import { useValidateContainerState } from '@/api/api'
import { clearCertificate } from '@/helpers/certificate-list.helpers'

export const validateContainerState = async (containerID: string) => {
  const data = await useValidateContainerState(containerID)
  if (!data) {
    throw new Error()
  }
  data.clear_certificate = clearCertificate(data.certificates)
  return data
}
