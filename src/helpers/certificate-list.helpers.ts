import { CertificateJSONResponse } from '@/types'

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
