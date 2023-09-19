import { api } from '@/api/index'
import {
  CertificateJSONResponse,
  CertificateJSONResponseList,
  Container,
  IpfsAttributes,
} from '@/types'
import { prepareCertificateImage, sleep } from '@/helpers'
import { JsonApiError } from '@distributedlab/jac'
import { errors } from '@/errors'
import { CONTAINER_STATUSES } from '@/enums'

export const updateCertificates = async (
  certificates: CertificateJSONResponse[],
  bitcoinAddress: string,
  name: string,
  url: string,
) => {
  try {
    const { data } = await api.post<Container>(
      '/integrations/ccp/certificate/bitcoin',
      {
        body: {
          data: {
            attributes: {
              certificates_data: certificates,
              address: bitcoinAddress,
              name: name,
              url: url,
            },
          },
        },
      },
    )
    return data
  } catch (error) {
    throw errors.FailedGenerateCertificate
  }
}

export const downloadCertificateImage = async (
  certificate: CertificateJSONResponse,
  bitcoinAddress: string,
  name: string,
  url: string,
) => {
  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/certificate/image',
    {
      body: {
        data: {
          attributes: {
            certificates_data: [certificate],
            address: bitcoinAddress,
            url: url,
            name: name,
          },
        },
      },
    },
  )

  return data
}

export const uploadCertificates = async (name: string, sheepUrl: string) => {
  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/users/',
    {
      body: {
        data: {
          attributes: {
            url: sheepUrl,
            name: name,
          },
        },
      },
    },
  )
  return prepareCertificateImage(data)
}

export const createPdf = async (
  certificates: CertificateJSONResponse[],
  bitcoinAddress: string,
  name: string,
  url: string,
) => {
  try {
    const { data } = await api.post<Container>(
      '/integrations/ccp/certificate/',
      {
        body: {
          data: {
            attributes: {
              certificates_data: certificates,
              address: bitcoinAddress,
              url: url,
              name: name,
            },
          },
        },
      },
    )
    return data
  } catch (error) {
    throw errors.FailedGenerateCertificate
  }
}

export const validateContainerState = async (containerID: string) => {
  await sleep(5000)
  const containerStatus = true
  while (containerStatus) {
    try {
      const { data } = await api.get<Container>(
        '/integrations/ccp/certificate/' + containerID,
      )
      if (data.status != CONTAINER_STATUSES.READY_STATUS) {
        await sleep(5000)
        continue
      }

      return data
    } catch (error) {
      if ((error as JsonApiError).httpStatus === 500) {
        throw errors.FailedCallApi
      }
      await sleep(5000)
    }
  }
}

export const sendToIPFS = async (
  description: string,
  img: Uint8Array,
  participant: string,
) => {
  try {
    const { data } = await api.post<IpfsAttributes>(
      '/integrations/ccp/certificate/ipfs',
      {
        body: {
          data: {
            attributes: {
              description: description,
              img: img,
              name: 'certificate - ' + participant,
            },
          },
        },
      },
    )
    return data
  } catch (error) {
    throw errors.FailedCallApi
  }
}

export const saveUserSetting = async (name: string) => {
  try {
    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      {
        body: {
          data: {
            attributes: {
              code: '',
              name: name,
            },
          },
        },
      },
    )
  } catch (error) {
    throw errors.FailedCallApi
  }
}

export const updateAuthCode = async (code: string, name: string) => {
  try {
    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      {
        body: {
          data: {
            attributes: {
              code: code,
              name: name,
            },
          },
        },
      },
    )
  } catch (error) {
    throw errors.FailedCallApi
  }
}
