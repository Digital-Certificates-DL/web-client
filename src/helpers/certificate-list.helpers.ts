import { CertificateJSONResponse, PottyCertificateRequest } from '@/types'
import { FILES_BASE } from '@/enums'
import { ref } from 'vue'
import { Signature } from '@/utils'

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

export const clearCertificate = (certificates: PottyCertificateRequest[]) => {
  const certificateList = ref<CertificateJSONResponse[]>([])
  for (const certificate of certificates) {
    certificate.attributes.id = Number(certificate.id)
    certificateList.value.push(certificate.attributes)
  }

  return certificateList.value
}

export const signCertificateData = async (
  users: CertificateJSONResponse[],
  key: string,
) => {
  const signature = new Signature(key)
  for (const user of users) {
    if (!user.signature) {
      user.signature = signature.signMsg(user.msg)
    }
  }

  return users
}

export const filterByCourse = (
  list: CertificateJSONResponse[],
  filter?: string,
): CertificateJSONResponse[] => {
  if (!filter || filter === 'All') {
    return list
  }

  const searchQuery = filter.toLowerCase()
  return list.filter(user => {
    const courseTitle = user.courseTitle.toLowerCase()
    return courseTitle.includes(searchQuery)
  })
}

export const filterByState = (
  list: CertificateJSONResponse[],
  filter: string,
): CertificateJSONResponse[] => {
  if (!filter.length || filter === 'All') {
    return list
  }

  if (filter === 'Generated') {
    return list.filter(certificate => {
      return certificate.certificate || certificate.digitalCertificate
    })
  } else if (filter === 'Not generated') {
    return list.filter(certificate => {
      return !certificate.signature!.length
    })
  }
  return list
}
