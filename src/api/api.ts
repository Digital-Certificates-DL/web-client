import { api } from '@/api/index'
import {
  CertificateJSONResponse,
  CertificateJSONResponseList,
  Container,
} from '@/types'
import { useUserStore } from '@/store'
import { sleep } from '@/helpers'
const userState = useUserStore()

export const useUpdateCertificates = async (
  certificates: CertificateJSONResponse[],
) => {
  const { data } = await api.post<Container>(
    '/integrations/ccp/certificate/bitcoin',
    {
      body: {
        data: {
          attributes: {
            certificates_data: certificates,
            address: userState.setting.userBitcoinAddress,
            name: userState.setting.accountName,
            url: userState.setting.urlGoogleSheet,
          },
        },
      },
    },
  )
  return data
}

export const useDownloadImage = async (
  certificate: CertificateJSONResponse,
) => {
  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/certificate/image',
    {
      body: {
        data: {
          attributes: {
            certificates_data: [certificate],
            address: userState.setting.userBitcoinAddress,
            url: userState.setting.urlGoogleSheet,
            name: userState.setting.accountName,
          },
        },
      },
    },
  )
  return data
}

export const useUploadCertificates = async () => {
  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/users/',
    {
      body: {
        data: {
          attributes: {
            url: userState.setting.urlGoogleSheet,
            name: userState.setting.accountName,
          },
        },
      },
    },
  )
  return data
}

export const useCreatePdf = async (certificates: CertificateJSONResponse[]) => {
  const { data } = await api.post<Container>('/integrations/ccp/certificate/', {
    body: {
      data: {
        attributes: {
          certificates_data: certificates,
          address: userState.setting.userBitcoinAddress,
          url: userState.setting.urlGoogleSheet,
          name: userState.setting.accountName,
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

export const useGetUpdateLink = async () => {
  const { data } = await api.post('/integrations/ccp/users/token', {
    body: {
      data: {
        attributes: {
          name: userState.setting.accountName,
        },
      },
    },
  })
  return data
}

export const useUpdateCode = async (code: string) => {
  await api.post<CertificateJSONResponseList>(
    '/integrations/ccp/users/settings',
    {
      body: {
        data: {
          attributes: {
            code: code,
            name: userState.setting.accountName,
          },
        },
      },
    },
  )
}
