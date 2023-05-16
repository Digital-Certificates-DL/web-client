export type PustTxResponce = {
  data: {
    tx: Tx
  }
}

export type Tx = {
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
  inputs: Input[]
  outputs: Output[]
}

export type Input = {
  prevHash: string
  outputIndex: number
  script: string
  outputValue: number
  sequence: number
  addresses: string[]
  scriptType: string
  age: number
}

export type Output = {
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
