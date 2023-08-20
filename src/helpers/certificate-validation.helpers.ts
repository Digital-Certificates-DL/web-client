import { CertificateJSONResponse } from '@/types'

export const validateListGenerate = (
  selectedItems: CertificateJSONResponse[],
): boolean => {
  for (const item of selectedItems) {
    if (Boolean(item.certificate) || Boolean(item.signature)) {
      return false
    }
  }
  return true
}

export const validateListTimestamp = (
  selectedItems: CertificateJSONResponse[],
): boolean => {
  for (const item of selectedItems) {
    if (!item.certificate || !item.signature) {
      return false
    }
  }
  return true
}
