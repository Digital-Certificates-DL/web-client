export type UserTypes = {
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

export type UserJSONResponse = {
  ID: string
  Type: string
  attributes: UserTypes
}

export type UserJSONResponseList = {
  data: UserJSONResponse[]
  Included: object[]
  Links: object
}

export type UserSetting = {
  Name: string
  Org: string
  SignKey: string
  Address: string
  KeyPathID: number
  SendKey: string
  Url: string
}


export type UnauthorizedTypesAttributes = {
  link: string
}

export type UnauthorizedTypes= {
  ID: string
  Type: string
  attributes: UnauthorizedTypesAttributes
}
export type UnauthorizedResponse = {
  data: UnauthorizedTypes
  Included: object[]
  Links: object
}
