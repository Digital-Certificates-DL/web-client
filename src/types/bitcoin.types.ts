export type PustTxResponce = {
  data: {
    tx: BitcoinTransaction
  }
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

export type UTXO = {
  txHash: string
  blockHeight: number
  txInputN: number
  txOutputN: number
  value: number
  refBalance: number
  spent: boolean
  spentBy: string
  confirmations: number
  confirmed: string
  doubleSpend: boolean
}
