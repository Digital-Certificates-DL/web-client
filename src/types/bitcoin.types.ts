export type PustTxResponce = {
  tx: BitcoinTransaction
}

export type BitcoinTransaction = {
  blockHeight: number
  hash: string
  addresses: string[]
  total: number
  fees: number
  size: number
  vsize: number
  preference: string
  relayedBy: string
  received: string
  ver: number
  lockTime: number
  doubleSpend: boolean
  vinSz: number
  voutSz: number
  confirmations: number
  inputs: BitcoinTransactionInput[]
  outputs: BitcoinTransactionOutput[]
}

export type BitcoinTransactionInput = {
  prevHash: string
  outputIndex: number
  script: string
  outputValue: number
  sequence: number
  addresses: string[]
  scriptType: string
  age: number
}

export type BitcoinTransactionOutput = {
  value: number
  script: string
  addresses: string[]
  scriptType: string
}

export interface AddressInfo {
  path: string
  address: string
  utxos: UTXO[]
}

export type BlockstreamTxList = Transaction[]

export type Transaction = {
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

export type Vin = {
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

export type Prevout = {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
}

export type Vout = {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
}

export type UTXO = {
  txid: string
  vout: number
  status: Status
  value: number
}

export type Status = {
  confirmed: boolean
  block_height: number
  block_hash: string
  block_time: number
}

export type GetTxHex = {
  hex: string
}
