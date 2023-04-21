export type PustTxResponce = {
  data: {
    tx: Tx
  }
}

export interface Tx {

  block_height: number
  hash: string
  addresses: string[]
  total: number
  fees: number
  size: number
  vsize: number
  preference: string
  relayed_by: string
  received: string
  ver: number
  lock_time: number
  double_spend: boolean
  vin_sz: number
  vout_sz: number
  confirmations: number
  inputs: Input[]
  outputs: Output[]
}

export interface Input {
  prev_hash: string
  output_index: number
  script: string
  output_value: number
  sequence: number
  addresses: string[]
  script_type: string
  age: number
}

export interface Output {
  value: number
  script: string
  addresses: string[]
  script_type: string
}