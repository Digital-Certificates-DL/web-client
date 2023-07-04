export type CertificateJSONResponse = {
  date: string
  participant: string
  courseTitle: string
  points: string
  serialNumber: string
  note: string
  certificate: string
  dataHash: string
  txHash: string
  signature: string | undefined
  digitalCertificate: string
  id: number
  msg: string
  certificateImg?: Uint8Array
  img?: string
}

export type PottyCertificateRequest = {
  id: string
  type: string
  attributes: CertificateJSONResponse
}

export type CertificateJSONResponseList = {
  data: CertificateJSONResponse[]
  included: object[]
  links: object
}
