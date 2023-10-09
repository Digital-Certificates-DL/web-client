import log from 'loglevel'
import { Bus } from '@/helpers'
import { i18n } from '@/localization'
import { errors } from '@/errors'

export class ErrorHandler {
  static process(error: Error | unknown, errorMessage = ''): void {
    const msgTranslation = errorMessage || ErrorHandler._getErrorMessage(error)

    if (msgTranslation) {
      Bus.error(msgTranslation)
    }

    ErrorHandler.processWithoutFeedback(error)
  }

  static processWithoutFeedback(error: Error | unknown): void {
    log.error(error)
  }

  static _getErrorMessage(error: Error | unknown): string {
    const { t } = i18n.global
    let errorMessage = ''

    if (error instanceof Error) {
      switch (error.constructor) {
        case errors.ProviderChainNotFoundError:
          errorMessage = t('errors.provider-chain-not-found-error')
          break
        case errors.ProviderNotSupportedError:
          errorMessage = t('errors.provider-not-supported-error')
          break
        case errors.ProviderUserRejectedRequest:
          break
        case errors.ProviderUnauthorized:
          errorMessage = t('errors.provider-unauthorized')
          break
        case errors.ProviderUnsupportedMethod:
          errorMessage = t('errors.provider-unsupported-method')
          break
        case errors.ProviderDisconnected:
          errorMessage = t('errors.provider-disconnected')
          break
        case errors.ProviderChainDisconnected:
          errorMessage = t('errors.provider-chain-disconnected')
          break
        case errors.ProviderParseError:
          errorMessage = t('errors.provider-parse-error')
          break
        case errors.ProviderInvalidRequest:
          errorMessage = t('errors.provider-invalid-request')
          break
        case errors.ProviderMethodNotFound:
          errorMessage = t('errors.provider-method-not-found')
          break
        case errors.ProviderInvalidParams:
          errorMessage = t('errors.provider-invalid-params')
          break
        case errors.ProviderInternalError:
          errorMessage = t('errors.provider-internal-error')
          break
        case errors.ProviderInvalidInput:
          errorMessage = t('errors.provider-invalid-input')
          break
        case errors.ProviderResourceNotFound:
          errorMessage = t('errors.provider-resource-not-found')
          break
        case errors.ProviderResourceUnavailable:
          errorMessage = t('errors.provider-resource-unavailable')
          break
        case errors.ProviderTransactionRejected:
          errorMessage = t('errors.provider-transaction-rejected')
          break
        case errors.ProviderMethodNotSupported:
          errorMessage = t('errors.provider-method-not-supported')
          break
        case errors.ProviderLimitExceeded:
          errorMessage = t('errors.provider-limit-exceeded')
          break
        case errors.ProviderJsonRpcVersionNotSupported:
          errorMessage = t('errors.provider-json-rpc-version-not-supported')
          break
        case errors.ProviderWrapperMethodNotFoundError:
          errorMessage = t('errors.provider-wrapper-method-not-found')
          break
        case errors.UnauthorizedError:
          errorMessage = t('errors.unauthorized')
          break
        case errors.FailedToSetInput:
          errorMessage = t('errors.failed-set-bitcoin-input')
          break
        case errors.EmptyContainerError:
          errorMessage = t('errors.empty-container')
          break
        case errors.EmptyImageError:
          errorMessage = t('errors.empty-img')
          break
        case errors.FailedDownloadImage:
          errorMessage = t('errors.failed-download-image')
          break
        case errors.FailedGetCertificates:
          errorMessage = t('errors.failed-get-certificates')
          break
        case errors.FailedCallApi:
          errorMessage = t('errors.failed-call-api')
          break
        case errors.FailedGenerateCertificate:
          errorMessage = t('errors.failed-generate-certificates')
          break
        case errors.EmptyBetterUTXO:
          errorMessage = t('errors.empty-better-utxo')
          break
        case errors.EmptySignKey:
          errorMessage = t('errors.empty-private-key')
          break
        case errors.RateLimit:
          errorMessage = t('errors.rate-limit')
          break
        default: {
          errorMessage = t('errors.default')
        }
      }
    }

    return errorMessage
  }
}
