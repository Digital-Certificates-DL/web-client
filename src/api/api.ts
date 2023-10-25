import { api } from '@/api'
import {
  CertificateJSONResponse,
  CertificateJSONResponseList,
  Container,
  IpfsAttributes,
  SavedTemplate,
  TemplateJSONItem,
} from '@/types'
import { prepareCertificateImage } from '@/helpers'
import { JsonApiBodyBuilder } from '@distributedlab/jac'
import { errors } from '@/errors'
import { prepareTemplatesImages } from '@/helpers/template-list.helpers'

export const updateCertificates = async (
  certificates: CertificateJSONResponse[],
  bitcoinAddress: string,
  name: string,
  url: string,
) => {
  try {
    const body = new JsonApiBodyBuilder()
      .setData({
        type: 'users',
        attributes: {
          certificates_data: certificates,
          address: bitcoinAddress,
          name: name,
          url: url,
        },
      })
      .build()

    const { data } = await api.post<Container>(
      '/integrations/ccp/certificate/bitcoin',
      { body },
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
  const body = new JsonApiBodyBuilder()
    .setData({
      type: 'download_image',
      attributes: {
        certificates_data: [certificate],
        address: bitcoinAddress,
        url: url,
        name: name,
      },
    })
    .build()
  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/certificate/image',
    { body },
  )

  return data
}

export const uploadCertificates = async (
  name: string,
  sheepUrl: string,
): Promise<CertificateJSONResponse[]> => {
  const body = new JsonApiBodyBuilder()
    .setData({
      type: 'parse_users',
      attributes: {
        url: sheepUrl,
        name: name,
      },
    })
    .build()

  const { data } = await api.post<CertificateJSONResponse[]>(
    '/integrations/ccp/users/',
    { body },
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
    const body = new JsonApiBodyBuilder()
      .setData({
        type: 'prepare_certificate',
        attributes: {
          certificates_data: certificates,
          address: bitcoinAddress,
          url: url,
          name: name,
        },
      })
      .build()

    const { data } = await api.post<Container>(
      '/integrations/ccp/certificate/',
      { body },
    )
    return data
  } catch (error) {
    throw errors.FailedGenerateCertificate
  }
}

export const validateContainerState = async (containerID: string) => {
  const { data } = await api.get<Container>(
    '/integrations/ccp/certificate/' + containerID,
  )

  return data
}

export const sendToIPFS = async (
  description: string,
  img: Uint8Array,
  participant: string,
) => {
  try {
    const body = new JsonApiBodyBuilder()
      .setData({
        type: 'ipfs_file_upload',
        attributes: {
          description: description,
          img: img,
          name: 'certificate - ' + participant,
        },
      })
      .build()

    const { data } = await api.post<IpfsAttributes>(
      '/integrations/ccp/certificate/ipfs',
      { body },
    )
    return data
  } catch (error) {
    throw errors.FailedCallApi
  }
}

export const saveUserSetting = async (name: string) => {
  try {
    const body = new JsonApiBodyBuilder()
      .setData({
        type: 'settings',
        attributes: {
          code: '',
          name: name,
        },
      })
      .build()

    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      { body },
    )
  } catch (error) {
    throw errors.FailedCallApi
  }
}

export const updateAuthCode = async (code: string, name: string) => {
  try {
    const body = new JsonApiBodyBuilder()
      .setData({
        type: 'settings',
        attributes: {
          code: code,
          name: name,
        },
      })
      .build()
    await api.post<CertificateJSONResponseList>(
      '/integrations/ccp/users/settings',
      { body },
    )
  } catch (error) {
    throw errors.FailedCallApi
  }
}

export const updateToken = async (name: string) => {
  try {
    const body = new JsonApiBodyBuilder()
      .setData({
        type: 'token',
        attributes: {
          name: name,
        },
      })
      .build()
    await api.post('/integrations/ccp/users/token', { body })
  } catch (error) {
    throw errors.FailedCallApi
  }
}

export const saveTemplate = async (
  bufferImg: string,
  template: SavedTemplate,
  templateName: string,
  accountName: string,
) => {
  const body = new JsonApiBodyBuilder()
    .setData({
      type: 'template',
      attributes: {
        background_img: bufferImg,
        is_completed: true,
        template: template,
        template_name: templateName,
      },
      relationships: {
        user: {
          data: {
            type: 'user',
            id: accountName,
          },
        },
      },
    })
    .build()
  await api.post('/integrations/ccp/certificate/template', { body })
}

export const uploadTemplates = async (
  name: string,
): Promise<TemplateJSONItem[]> => {
  const { data } = await api.get<TemplateJSONItem[]>(
    '/integrations/ccp/certificate/template/' + name,
  )
  if (!data) {
    return []
  }

  return prepareTemplatesImages(data)
}
