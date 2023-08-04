import { testnet } from 'ecpair/src/networks'
import * as bitcoin from 'bitcoinjs-lib'
import { BIP32Factory, BIP32Interface } from 'bip32'
import * as ecc from 'tiny-secp256k1'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import { mnemonicToSeedAsync } from 'bip39-web'
import axios from 'axios'
import { BN } from '@distributedlab/tools'
import { Network } from 'bitcoinjs-lib'
import { PreparedTX, PustTxResponce, UTXO } from '@/types'

const bip32 = BIP32Factory(ecc)
const ECPair = ECPairFactory(ecc)

// the file will be heavily modified in the next request
// and now you can not watch it
export class Bitcoin {
  static readonly TX_FEE_COEFS = {
    numberOfInputs: 148,
    numberOfOutputs: 34,
    overhead: 10,
  }

  static readonly TX_OUTPUTS_INFO = {
    numberOfOutputs: 3,
    firstOutput: 555,
    secondOutput: 556,
    thirdOutput: 557,
  }

  static prepareLegacyTXTestnet = async (
    mnemonicPhrase: string,
    derivePath: number,
    txID?: string,
  ): Promise<PreparedTX> => {
    const seed = await mnemonicToSeedAsync(mnemonicPhrase)

    const bip = bip32.fromSeed(seed, testnet)
    const { address, keyPair } = this.keyByIndex(bip, derivePath)
    if (!address) {
      throw new Error()
    }

    derivePath++

    const ex = this.keyByIndex(bip, derivePath)
    if (!ex.address) {
      throw new Error()
    }

    const exAddress = ex.address
    const psbt = new bitcoin.Psbt({ network: testnet })
    const hex = await this.createTx(psbt, address, exAddress, keyPair, txID)

    return {
      hex,
      exAddress,
      derivePath,
    }
  }

  static async createTx(
    psbt: bitcoin.Psbt,
    address: string,
    exAddress: string,
    keyPair: ECPairInterface,
    txID?: string,
  ): Promise<string> {
    let fee = BN.fromRaw(0)
    let bestUTXOAmount = BN.fromRaw(0)
    let utxo: UTXO[] = []
    if (!txID) {
      const txInputInfo = await this.prepareUTXO(address)
      if (!txInputInfo.fee || !txInputInfo.txs) {
        throw new Error('')
      }

      fee = txInputInfo.fee
      utxo = txInputInfo.txs
      bestUTXOAmount = txInputInfo.amount
    }
    if (utxo.length) {
      psbt = await this.setInputs(psbt, utxo)
    }

    psbt = await this.setOutput(psbt, bestUTXOAmount, fee, exAddress)

    psbt.signInput(0, keyPair)
    psbt.finalizeAllInputs()

    return psbt.extractTransaction().toHex()
  }

  static async prepareUTXO(address: string) {
    const utxos = await this.getUTXO(address)
    if (!utxos) {
      throw new Error()
    }

    const txValue = BN.fromRaw(this.TX_OUTPUTS_INFO.firstOutput)
      .add(BN.fromRaw(this.TX_OUTPUTS_INFO.secondOutput))
      .add(BN.fromRaw(this.TX_OUTPUTS_INFO.thirdOutput))

    return this.betterUtxoTestnet(
      utxos,
      this.TX_OUTPUTS_INFO.numberOfOutputs,
      txValue,
    )
  }

  static async setInputs(
    psbt: bitcoin.Psbt,
    utxo: UTXO[],
  ): Promise<bitcoin.Psbt> {
    const promises = [] as Promise<bitcoin.Psbt>[]
    for (let i = 0; i < utxo.length; i++) {
      const promise = new Promise<bitcoin.Psbt>((resolve, reject) => {
        try {
          resolve(this.setInput(psbt, utxo[i]))
        } catch (error) {
          reject(error)
        }
      })
      promises.push(promise)
    }

    await Promise.all(promises)
    return psbt
  }

  static async setInput(psbt: bitcoin.Psbt, utxo: UTXO) {
    try {
      const hex = await this.getTxTestnet(utxo.txHash)
      const txHex = new Buffer(hex, 'hex')
      psbt.addInput({
        hash: utxo.txHash,
        index: utxo.txOutputN,
        nonWitnessUtxo: txHex,
      })
      return psbt
    } catch (error) {
      throw new Error()
    }
  }

  static async setOutput(
    psbt: bitcoin.Psbt,
    balance: BN,
    fee: BN,
    exAddress: string,
  ): Promise<bitcoin.Psbt> {
    psbt.addOutput({
      address: '2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2',
      value: this.TX_OUTPUTS_INFO.firstOutput,
    })
    psbt.addOutput({
      address: 'n1NffJM6mDvv27nPzxY8UdozxWbkQpjHS2',
      value: this.TX_OUTPUTS_INFO.secondOutput,
    })
    psbt.addOutput({
      address: 'n2AgWQWzkQoKFbw8p8RkM5uEV2ZdKwDUTi',
      value: this.TX_OUTPUTS_INFO.thirdOutput,
    })

    balance = balance.div(
      BN.fromRaw(this.TX_OUTPUTS_INFO.firstOutput)
        .add(BN.fromRaw(this.TX_OUTPUTS_INFO.secondOutput))
        .add(BN.fromRaw(this.TX_OUTPUTS_INFO.thirdOutput)),
    )

    balance = balance.div(fee)

    psbt.addOutput({
      address: exAddress,
      value: Number(balance.value),
    })

    return psbt
  }

  static async getUTXO(address: string): Promise<UTXO[]> {
    try {
      const { data } = await axios.get(
        'https://api.blockcypher.com/v1/btc/test3/addrs/' +
          address +
          '?unspentOnly=true',
      )

      let txs = [] as UTXO[]
      if (data.txrefs) {
        txs = data.txrefs
      }

      if (data.unconfirmed_txrefs) {
        txs = txs.concat(data.unconfirmed_txrefs)
      }

      return txs
    } catch (error) {
      throw new Error()
    }
  }

  static async sendToTestnet(tx: string): Promise<PustTxResponce> {
    try {
      const { data } = await axios.post<PustTxResponce>(
        'https://api.blockcypher.com/v1/btc/test3/txs/push',
        { tx: tx },
      )
      return data
    } catch (error) {
      throw new Error()
    }
  }

  static async calculateFeeTestnet(outs: number, ins: number) {
    const inputs = BN.fromRaw(ins, 10)
    const outputs = BN.fromRaw(outs, 10)
    const coefNumberOfInputs = BN.fromRaw(this.TX_FEE_COEFS.numberOfInputs, 10)
    const coefNumberOfOutputs = BN.fromRaw(
      this.TX_FEE_COEFS.numberOfOutputs,
      10,
    )
    const coefOverhead = BN.fromRaw(this.TX_FEE_COEFS.overhead, 10)

    const size = inputs
      .mul(coefNumberOfInputs)
      .add(outputs.mul(coefNumberOfOutputs))
      .add(coefOverhead)
      .div(inputs)

    try {
      const { data } = await axios.get(
        'https://bitcoinfees.earn.com/api/v1/fees/recommended',
      )
      return size.mul(BN.fromRaw(data.hourFee, 10))
    } catch (error) {
      throw new Error()
    }
  }

  private static async getTxTestnet(hash: string) {
    try {
      const { data } = await axios.get(
        'https://api.blockcypher.com/v1/btc/test3/txs/' +
          hash +
          '?includeHex=true',
      )

      return data.hex
    } catch (error) {
      throw new Error()
    }
  }

  private static async betterUtxoTestnet(
    txs: UTXO[],
    outs: number,
    txsValue: BN,
  ) {
    const largeTxs: UTXO[] = []
    const smaller: UTXO[] = []
    let fee = await this.calculateFeeTestnet(outs, 1)
    fee = fee.add(txsValue)
    for (const tx of txs) {
      if (BN.fromRaw(tx.value) > fee) {
        largeTxs.push(tx)
      } else {
        smaller.push(tx)
      }
    }
    smaller.reverse()
    largeTxs.sort()
    if (smaller.length > 1) {
      let bufferValue = BN.fromRaw(0)
      const utxos = []
      for (let i = 0; i < smaller.length; i++) {
        fee = await this.calculateFeeTestnet(outs, i)
        fee = fee.add(txsValue)
        if (bufferValue < fee) {
          bufferValue = bufferValue.add(BN.fromRaw(smaller[i].value))
          utxos.push(smaller[i])
        } else {
          return {
            txs: utxos,
            amount: bufferValue,
            fee: fee,
          }
        }
      }
    }
    const utxoRes: UTXO[] = []
    utxoRes.push(largeTxs[0])
    return {
      txs: utxoRes,
      amount: BN.fromRaw(largeTxs[0].value),
      fee: fee,
    }
  }

  static getAddressFromWIF(wif: string, network?: Network) {
    const keyPairex = ECPair.fromWIF(wif, network)
    const key = bitcoin.payments.p2pkh({
      pubkey: keyPairex.publicKey,
      network: network,
    })

    return key.address
  }

  static keyByIndex(
    bip: BIP32Interface,
    derivePath: number,
  ): { address: string | undefined; keyPair: ECPairInterface } {
    const key = bip.derive(derivePath)
    const keyPair = ECPair.fromWIF(key.toWIF(), testnet)

    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: testnet,
    })
    return {
      address: address,
      keyPair: keyPair,
    }
  }
}

export default {
  Bitcoin,
}
