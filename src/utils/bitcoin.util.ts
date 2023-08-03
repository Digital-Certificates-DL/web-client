import { testnet } from 'ecpair/src/networks'
import * as bitcoin from 'bitcoinjs-lib'
import BIP32Factory from 'bip32'
import * as ecc from 'tiny-secp256k1'
const bip32 = BIP32Factory(ecc)
import ECPairFactory from 'ecpair'
import { mnemonicToSeedAsync } from 'bip39-web'
import axios from 'axios'
import { Network } from 'bitcoinjs-lib'
import { PustTxResponce, UTXO } from '@/types/bitcoin.types'

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
    const key = bip.derive(index)
    const keyPair = ECPair.fromWIF(key.toWIF(), testnet)

    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: testnet,
    })

    index++
    const exchangeKey = bip.derive(index)
    const keyPairex = ECPair.fromWIF(exchangeKey.toWIF(), testnet)
    const ex = bitcoin.payments.p2pkh({
      pubkey: keyPairex.publicKey,
      network: testnet,
    })

    const psbt = new bitcoin.Psbt({ network: testnet })
    let fee = 0
    let butxoAmount = 0
    let utxo: UTXO[] = []
    if (!txID) {
      const utxos = await axios
        .get(
          'https://api.blockcypher.com/v1/btc/test3/addrs/' +
            address +
            '?unspentOnly=true',
        )
        .then(function (response) {
          let txs = []
          if (response.data.txrefs) {
            txs = response.data.txrefs
          }

          if (response.data.unconfirmed_txrefs) {
            txs = txs.concat(response.data.unconfirmed_txrefs)
          }

          return txs
        })

      if (!utxos) {
        return
      }
      const { txs, utxoAmount, value } = await this.betterUtxoTestnet(
        utxos,
        this.TX_OUTPUTS_INFO.numberOfOutputs,
        this.TX_OUTPUTS_INFO.firstOutput +
          this.TX_OUTPUTS_INFO.secondOutput +
          this.TX_OUTPUTS_INFO.thirdOutput,
      )
      fee = value
      utxo = txs
      butxoAmount = utxoAmount || 0
    }
    if (utxo.length) {
      for (let i = 0; i < utxo.length; i++) {
        const hex = await this.getTxTestnet(utxo[i].txHash)
        const txHex = new Buffer(hex, 'hex')
        psbt.addInput({
          hash: utxo[i].txHash,
          index: utxo[i].txOutputN,
          nonWitnessUtxo: txHex,
        })
      }
    }

    let balance = butxoAmount
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
      address: ex.address || '',
      value: balance,
    })

    psbt.signInput(0, keyPair)
    psbt.finalizeAllInputs()
    const hex = psbt.extractTransaction().toHex()
    const exAddress = ex.address
    return {
      hex,
      exAddress,
      index,
    }
  }

  static async SendToTestnet(tx: string) {
    const res = await axios
      .post('https://api.blockcypher.com/v1/btc/test3/txs/push', { tx: tx })
      .then(function (response) {
        return response
      })
      .catch(function (err) {
        return err
      })

    return res as PustTxResponce
  }

  static async calculateFeeTestnet(outs: number, ins: number) {
    const size =
      ins * this.TX_FEE_COEFS.numberOfInputs +
      outs * this.TX_FEE_COEFS.numberOfOutputs +
      this.TX_FEE_COEFS.overhead -
      ins
    let fee = 10
    fee = await axios
      .get('https://bitcoinfees.earn.com/api/v1/fees/recommended')
      .then(response => {
        return response.data.hourFee
      })
      .catch(err => {
        return err
      })

    return size * Number(fee)
  }

  private static async getTxTestnet(hash: string) {
    const tx = await axios
      .get(
        'https://api.blockcypher.com/v1/btc/test3/txs/' +
          hash +
          '?includeHex=true',
      )
      .then(response => {
        return response.data.hex
      })
      .catch(err => {
        return err
      })
    return tx
  }

  private static async betterUtxoTestnet(
    txs: UTXO[],
    outs: number,
    txsValue: number,
  ) {
    const largeTxs: UTXO[] = []
    const smaller: UTXO[] = []
    let value = await this.calculateFeeTestnet(outs, 1)
    value += txsValue
    for (const tx of txs) {
      if (tx.value > value) {
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
        value = await this.calculateFeeTestnet(outs, i)
        value += txsValue
        if (bufferValue < value) {
          bufferValue += smaller[i].value
          utxos.push(smaller[i])
        } else {
          return {
            txs: utxos,
            utxoAmount: bufferValue,
            value: value,
          }
        }
      }
    }
    const utxoRes: UTXO[] = []
    utxoRes.push(largeTxs[0])
    return {
      txs: utxoRes,
      utxoAmount: largeTxs[0].value,
      value: value,
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
}

export default {
  Bitcoin,
}
