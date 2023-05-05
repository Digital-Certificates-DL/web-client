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

export interface TxList {
  address: string
  total_received: number
  total_sent: number
  balance: number
  unconfirmed_balance: number
  final_balance: number
  n_tx: number
  unconfirmed_n_tx: number
  final_n_tx: number
  txrefs: UTXO[]
  unconfirmed_txrefs: UTXO[]
  tx_url: string
}

export interface UTXO {
  tx_hash: string
  block_height: number
  tx_input_n: number
  tx_output_n: number
  value: number
  ref_balance: number
  spent: boolean
  spent_by: string
  confirmations: number
  confirmed: string
  double_spend: boolean
}

export interface AddressInfo {
  path: string
  address: string
  utxos: UTXO[]
}

//////////////////////////
export interface TxsListNewAPI {
  hash160: string
  address: string
  n_tx: number
  total_received: number
  total_sent: number
  final_balance: number
  txs: TxNewAPI[]
}

export interface TxNewAPI {
  ver: number
  inputs: Input[]
  block_height: number
  relayed_by: string
  out: OutNewAPI[]
  lock_time: number
  result: number
  size: number
  time: number
  tx_index: number
  vin_sz: number
  hash: string
  vout_sz: number
}

export interface InputNewAPI {
  sequence: number
  prev_out: PrevOutNewAPI
  script: string
}

export interface PrevOutNewAPI {
  spent: boolean
  tx_index: number
  type: number
  addr: string
  value: number
  n: number
  script: string
}

export interface OutNewAPI {
  spent: boolean
  tx_index: number
  type: number
  addr: string
  value: number
  n: number
  script: string
}

export type AddressInfoNewAPI = {
  path: string
  address: string
  utxos: TxNewAPI[]
}
