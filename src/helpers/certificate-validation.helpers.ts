import { CertificateJSONResponse } from '@/types'

export const validateListNeedToGenerate = (
  selectedItems: CertificateJSONResponse[],
): boolean => {
  for (const item of selectedItems) {
    if (Boolean(item.certificate) || Boolean(item.signature)) {
      return false
    }
  }
  return true
}

export const validateListCanMakeTimestamp = (
  selectedItems: CertificateJSONResponse[],
): boolean => {
  for (const item of selectedItems) {
    if (!item.certificate || !item.signature) {
      return false
    }
  }
  return true
}
