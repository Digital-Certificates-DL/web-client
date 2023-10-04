import { config } from '@config'
import { JsonApiClient } from '@distributedlab/jac'
import { attachErrorHandler } from '@/api'

export * from './api'
export * from './api-interceptor'
export let api: JsonApiClient

export function initApi(): void {
  api = new JsonApiClient(
    {
      baseUrl: config.API_URL,
      credentials: 'same-origin',
    },
    [{ error: attachErrorHandler }],
  )
}
