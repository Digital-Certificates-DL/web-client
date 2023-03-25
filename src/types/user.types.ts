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
  SignKey: string
  address: string
  SendKey: string
  Url: string
}
