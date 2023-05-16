export type UserJSONResponse = {
  Date: string
  Participant: string
  CourseTitle: string
  Points: string
  SerialNumber: string
  Note: string
  Certificate: string
  DataHash: string
  TxHash: string
  Signature: string | undefined
  DigitalCertificate: string
  ID: number
  Msg: string
  CertificateImg: Uint8Array
  Img: string
}

export type UserJSONResponseList = {
  data: UserJSONResponse[]
  Included: object[]
  Links: object
}

export type UserSetting = {
  name: string
  org: string
  signKey: string
  address: string
  keyPathID: number
  lastExAddress: string
  sendMnemonicPhrase: string
  url: string
}
