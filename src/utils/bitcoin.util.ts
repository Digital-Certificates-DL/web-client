import { testnet } from 'ecpair/src/networks'
import * as bitcoin from 'bitcoinjs-lib'
import { BIP32Factory } from 'bip32'
import * as ecc from 'tiny-secp256k1'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import { mnemonicToSeedAsync } from 'bip39-web'
import axios from 'axios'
import { BIP32Interface, Network } from 'bitcoinjs-lib'
import { PustTxResponce, UTXO } from '@/types'

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

  static PrepareLegacyTXTestnet = async (
    mnemonicPhrase: string,
    index: number,
    txID?: string,
  ) => {
    const seed = await mnemonicToSeedAsync(mnemonicPhrase)

    const bip = bip32.fromSeed(seed, testnet)
    const { address, keyPair } = this.keyByIndex(bip, index)
    if (!address) {
      throw new Error('') //todo handle error
    }

    index++

    const ex = this.keyByIndex(bip, index)
    if (!ex.address) {
      throw new Error('')
    }

    const exAddress = ex.address
    const psbt = new bitcoin.Psbt({ network: testnet })
    const hex = await this.createTx(psbt, address, exAddress, keyPair, txID)

    return {
      hex,
      exAddress,
      index,
    }
  }

  static async createTx(
    psbt: bitcoin.Psbt,
    address: string,
    exAddress: string,
    keyPair: ECPairInterface,
    txID?: string,
  ): Promise<string> {
    let fee = 0
    let bestUTXOAmount = 0
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
      throw new Error() //todo handle error
    }
    return this.betterUtxoTestnet(
      utxos,
      this.TX_OUTPUTS_INFO.numberOfOutputs,
      this.TX_OUTPUTS_INFO.firstOutput +
        this.TX_OUTPUTS_INFO.secondOutput +
        this.TX_OUTPUTS_INFO.thirdOutput,
    )
  }

  static async setInputs(
    psbt: bitcoin.Psbt,
    utxo: UTXO[],
  ): Promise<bitcoin.Psbt> {
    for (let i = 0; i < utxo.length; i++) {
      const hex = await this.getTxTestnet(utxo[i].txHash)
      const txHex = new Buffer(hex, 'hex')
      psbt.addInput({
        hash: utxo[i].txHash,
        index: utxo[i].txOutputN,
        nonWitnessUtxo: txHex,
      })
    }

    return psbt
  }

  static async setOutput(
    psbt: bitcoin.Psbt,
    balance: number,
    fee: number,
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

    balance -=
      this.TX_OUTPUTS_INFO.firstOutput +
      this.TX_OUTPUTS_INFO.secondOutput +
      this.TX_OUTPUTS_INFO.thirdOutput
    balance -= fee

    psbt.addOutput({
      address: exAddress,
      value: balance,
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

      return txs //todo add types
    } catch (error) {
      throw new Error('') //todo handle error
    }
  }

  static async SendToTestnet(tx: string): Promise<PustTxResponce> {
    try {
      const { data } = await axios.post<PustTxResponce>(
        'https://api.blockcypher.com/v1/btc/test3/txs/push',
        { tx: tx },
      )
      return data
    } catch (error) {
      throw new Error('') //todo handle error
    }
  }

  static async calculateFeeTestnet(outs: number, ins: number) {
    const size =
      ins * this.TX_FEE_COEFS.numberOfInputs +
      outs * this.TX_FEE_COEFS.numberOfOutputs +
      this.TX_FEE_COEFS.overhead -
      ins

    try {
      const { data } = await axios.get(
        'https://bitcoinfees.earn.com/api/v1/fees/recommended',
      )
      return size * Number(data.hourFee)
    } catch (error) {
      throw new Error('') //todo handle error
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
      throw new Error('') //todo handle error
    }
  }

  private static async betterUtxoTestnet(
    txs: UTXO[],
    outs: number,
    txsValue: number,
  ) {
    const largeTxs: UTXO[] = []
    const smaller: UTXO[] = []
    let fee = await this.calculateFeeTestnet(outs, 1)
    fee += txsValue
    for (const tx of txs) {
      if (tx.value > fee) {
        largeTxs.push(tx)
      } else {
        smaller.push(tx)
      }
    }
    smaller.reverse()
    largeTxs.sort()
    if (smaller.length > 1) {
      let bufferValue = 0
      const utxos = []
      for (let i = 0; i < smaller.length; i++) {
        fee = await this.calculateFeeTestnet(outs, i)
        fee += txsValue
        if (bufferValue < fee) {
          bufferValue += smaller[i].value
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
      amount: largeTxs[0].value,
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
    index: number,
  ): { address: string | undefined; keyPair: ECPairInterface } {
    const key = bip.derive(index)
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
