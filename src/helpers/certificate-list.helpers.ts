import { CertificateJSONResponse } from '@/types'
import { FILES_BASE } from '@/enums'

export const useSearchInTheList = (
  certificatesList: CertificateJSONResponse[],
  data: string,
) => {
  const searchQuery = data.toLowerCase()
  certificatesList = certificatesList.filter(certificate => {
    const title = certificate.participant.toLowerCase()
    return title.includes(searchQuery)
  })
  return certificatesList
}
export const usePrepareCertificateImage = (
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
