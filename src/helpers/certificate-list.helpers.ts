import { CertificateJSONResponse } from '@/types'
import { FILES_BASE } from '@/enums'

export const searchInTheList = (
  certificatesList: CertificateJSONResponse[],
  data: string,
) => {
  const searchQuery = data.toLowerCase()
  return certificatesList.filter(certificate => {
    return certificate.participant.toLowerCase().includes(searchQuery)
  })
}

export const prepareCertificateImage = (
  certificates: CertificateJSONResponse[],
) => {
  for (const certificate of certificates) {
    if (!certificate.certificateImg) {
      certificate.img = ''
      continue
    }
    certificate.img =
      FILES_BASE.PNG_BASE + certificate.certificateImg.toString()
  }

  return certificates
}
