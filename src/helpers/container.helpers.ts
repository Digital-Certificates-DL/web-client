import { sleep } from '@/helpers'
import { cleanCertificate } from '@/helpers/certificate-list.helpers'
import { errors } from '@/errors'
import { validateContainerState } from '@/api'
import { CONTAINER_STATUSES } from '@/enums'

export const validateContainerStateHandler = async (containerID: string) => {
  //TODO  add the option to continue this process later
  //TODO  create modal  with  button  -  try  again
  for (let i = 0; i < 1; i++) {
    await sleep(5000)

    try {
      const data = await validateContainerState(containerID)
      if (data && data.status == CONTAINER_STATUSES.READY_STATUS) {
        return data
      }
    } catch (error) {
      throw errors.FailedCallApi
    }
  }

  throw errors.RateLimit
}

export const validateContainerStateWrapper = async (containerID: string) => {
  const data = await validateContainerStateHandler(containerID)
  if (!data) {
    throw errors.EmptyContainerError
  }
  data.clear_certificate = cleanCertificate(data.certificates)
  return data
}
