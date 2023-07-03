import {
  CertificateJSONResponse,
  PottyCertificateRequest,
} from '@/types/certificate.types'

export type Container = {
  certificates: PottyCertificateRequest[]
  clear_certificate: CertificateJSONResponse[]
  status: boolean
  container_id: string
}
