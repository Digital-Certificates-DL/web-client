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
  Signature: string
  DigitalCertificate: string
  ID: number
  Msg: string
}

export type UserJSONResponse = {
  ID: string
  Type: string
  Attribute: UserTypes
}

export type UserJSONResponseList = {
  Data: UserJSONResponse[]
  Included: object[]
  Links: object
}
