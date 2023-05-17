export type UserJSONResponse = {
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
  certificateImg: Uint8Array
  img: string
}

export type UserJSONResponseList = {
  data: UserJSONResponse[]
  included: object[]
  links: object
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
