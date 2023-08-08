import {
  required as _required,
  email as _email,
  minLength as _minLength,
  maxLength as _maxLength,
  sameAs as _sameAs,
} from '@vuelidate/validators'
import { ValidationRule } from '@vuelidate/core'
import { Ref } from 'vue'
import { createI18nMessage, MessageProps } from '@vuelidate/validators'
import { get } from 'lodash-es'
import { i18n } from '@/localization'
import { Bip39 } from '@ts-bitcoin/core'

const { t } = i18n.global || i18n

const messagePath = ({ $validator }: MessageProps) =>
  `validations.field-error_${$validator}`

const withI18nMessage = createI18nMessage({ t, messagePath })

export const validateAddress = (address: string): boolean => {
  const re = new RegExp('^0x[a-fA-F0-9]{40}$')
  return re.test(address)
}

export const required = <ValidationRule>withI18nMessage(_required)

export const validateMnemonic = (mnemonic: string): boolean => {
  return Bip39.isValid(mnemonic)
}

export const validateLink = (link: string): boolean => {
  return link.includes('https://docs.google.com/spreadsheets')
}
export const email = <ValidationRule>withI18nMessage(_email)

export const minLength = (length: number): ValidationRule =>
  <ValidationRule>withI18nMessage(_minLength(length))

export const maxLength = (length: number): ValidationRule =>
  <ValidationRule>withI18nMessage(_maxLength(length))

export const sameAs = (field: Ref): ValidationRule => {
  return <ValidationRule>withI18nMessage(_sameAs(field, get(field, '_key')))
}

export const address = <ValidationRule>withI18nMessage(validateAddress)

export const mnemonic = <ValidationRule>withI18nMessage(validateMnemonic)
export const link = <ValidationRule>withI18nMessage(validateLink)
