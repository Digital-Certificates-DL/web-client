import * as runtimeErrors from './runtime.errors'
import { errors as serverErrors } from '@distributedlab/jac'

export const errors = {
  ...runtimeErrors,
  ...serverErrors,
}
