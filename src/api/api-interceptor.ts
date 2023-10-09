import {
  HTTP_METHODS,
  HTTP_STATUS_CODES,
  FetcherResponse,
  Fetcher,
} from '@distributedlab/fetcher'
import { JsonApiResponseErrors } from '@distributedlab/jac'
import { updateToken } from '@/api'
import { useUserStore } from '@/store'

export const attachErrorHandler = async (
  response: FetcherResponse<JsonApiResponseErrors>,
) => {
  if (response?.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
    const userStore = useUserStore()
    await updateToken(userStore.userSetting.accountName)
  }

  const url = new URL(response?.request.url)

  return new Fetcher({ baseUrl: url.origin }).request({
    endpoint: url.pathname,
    method: response?.request.method as HTTP_METHODS,
    ...(response?.request?.body && { body: response?.request.body }),
  })
}
