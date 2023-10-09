/**
 * General runtime error
 */
export class RuntimeError extends Error {}
export class ProviderWrapperMethodNotFoundError extends RuntimeError {}

export class ProviderChainNotFoundError extends RuntimeError {}

export class ProviderNotSupportedError extends RuntimeError {}

export class ProviderUserRejectedRequest extends RuntimeError {}

export class ProviderUnauthorized extends RuntimeError {}

export class ProviderUnsupportedMethod extends RuntimeError {}

export class ProviderDisconnected extends RuntimeError {}

export class ProviderChainDisconnected extends RuntimeError {}

export class ProviderChainUnrecognized extends RuntimeError {}

export class ProviderParseError extends RuntimeError {}

export class ProviderInvalidRequest extends RuntimeError {}

export class ProviderMethodNotFound extends RuntimeError {}

export class ProviderInvalidParams extends RuntimeError {}

export class ProviderInternalError extends RuntimeError {}

export class ProviderInvalidInput extends RuntimeError {}

export class ProviderResourceNotFound extends RuntimeError {}

export class ProviderResourceUnavailable extends RuntimeError {}

export class ProviderTransactionRejected extends RuntimeError {}

export class ProviderMethodNotSupported extends RuntimeError {}

export class ProviderLimitExceeded extends RuntimeError {}

export class ProviderJsonRpcVersionNotSupported extends RuntimeError {}

export class FailedToSetInput extends RuntimeError {}

export class UnauthorizedError extends RuntimeError {}

export class EmptyContainerError extends RuntimeError {}

export class EmptyImageError extends RuntimeError {}

export class EmptyBetterUTXO extends RuntimeError {}
export class EmptySignKey extends RuntimeError {}

export class FailedDownloadImage extends RuntimeError {}
export class FailedGetCertificates extends RuntimeError {}
export class FailedCallApi extends RuntimeError {}

export class FailedGenerateCertificate extends RuntimeError {}

export class RateLimit extends RuntimeError {}
