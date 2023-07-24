import { api } from '@/api/index'
import {
  CertificateJSONResponse,
  CertificateJSONResponseList,
  Container,
  IpfsAttributes,
} from '@/types'
import { sleep } from '@/helpers'

export const useUpdateCertificates = async (
  certificates: CertificateJSONResponse[],
  bitcoinAddress: string,
  name: string,
  url: string,
) => {
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
}

export const useDownloadImage = async (
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

export const useUploadCertificates = async (name: string, sheepUrl: string) => {
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
  return data
}

export const useCreatePdf = async (
  certificates: CertificateJSONResponse[],
  bitcoinAddress: string,
  name: string,
  url: string,
) => {
  const { data } = await api.post<Container>('/integrations/ccp/certificate/', {
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
  })
  return data
}

export const useValidateContainerState = async (containerID: string) => {
  await sleep(5000)
  const containerStatus = true
  while (containerStatus) {
    try {
      const { data } = await api.get<Container>(
        '/integrations/ccp/certificate/' + containerID,
      )
      if (data.status != 'ready_status') {
        await sleep(5000)
        continue
      }

      return data
    } catch (error) {
      await sleep(5000)
      // ErrorHandler.process(error)
    }
  }
}

export const useGetUpdateLink = async (name: string) => {
  const { data } = await api.post('/integrations/ccp/users/token', {
    body: {
      data: {
        attributes: {
          name: name,
        },
      },
    },
  })
  return data
}

export const useUpdateCode = async (code: string, name: string) => {
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
}

export const useSendToIPFS = async (
  description: string,
  img: Uint8Array,
  participant: string,
) => {
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
}

export const useSaveUserSetting = async (name: string) => {
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
}
