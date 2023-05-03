import { config } from '@config'
import { JsonApiClient } from '@distributedlab/jac'

export let api: JsonApiClient

export function initApi(): void {
  api = new JsonApiClient({
    baseUrl: config.API_URL,
    credentials: 'same-origin',
  })
}
