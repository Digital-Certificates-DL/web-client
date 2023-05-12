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

export interface AddressInfo {
  path: string
  address: string
  utxos: UTXOs
}

////////////////

export type BlockstreamTxList = Tx[]

export interface Tx {
  txid: string
  version: number
  locktime: number
  vin: Vin[]
  vout: Vout[]
  size: number
  weight: number
  fee: number
  status: Status
}

export interface Vin {
  txid: string
  vout: number
  prevout: Prevout
  scriptsig: string
  scriptsig_asm: string
  witness: string[]
  is_coinbase: boolean
  sequence: number
  inner_redeemscript_asm?: string
}

export interface Prevout {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
}

export interface Vout {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
}

export interface Status {
  confirmed: boolean
  block_height: number
  block_hash: string
  block_time: number
}

export type UTXOs = UTXO[]

export interface UTXO {
  txid: string
  vout: number
  status: Status
  value: number
}

export interface Status {
  confirmed: boolean
  block_height: number
  block_hash: string
  block_time: number
}
