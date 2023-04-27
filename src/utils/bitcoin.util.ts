import { testnet } from 'ecpair/src/networks'
import * as bitcoin from 'bitcoinjs-lib'
import BIP32Factory from 'bip32'
import * as ecc from 'tiny-secp256k1'
const bip32 = BIP32Factory(ecc)
import ECPairFactory from 'ecpair'
import { mnemonicToSeedAsync } from 'bip39-web'

const ECPair = ECPairFactory(ecc)
import axios from 'axios'
import { Network } from 'bitcoinjs-lib/src/networks'
import { PustTxResponce, UTXO } from '@/types/bitcoin.types'

//todo  find utxos in first 100 keys

export class Bitcoin {
  static PrepareLegacyTXTestnet = async (
    mnph: string,
    index: number,
    txID?: string,
  ) => {
    const seed = await mnemonicToSeedAsync(mnph).then(bytes => {
      return bytes
    })

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
        3,
        556 + 557 + 558,
      )
      fee = value
      utxo = txs
      butxoAmount = utxoAmount || 0
    }
    if (utxo.length) {
      for (let i = 0; i < utxo.length; i++) {
        const hex = await this.getTxTestnet(utxo[i].tx_hash)
        const txHex = new Buffer(hex, 'hex')
        psbt.addInput({
          hash: utxo[i].tx_hash,
          index: utxo[i].tx_output_n,
          nonWitnessUtxo: txHex,
        })
      }
    }

    let balance = butxoAmount
    psbt.addOutput({
      address: '2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2',
      value: 556,
    })
    psbt.addOutput({
      address: 'n1NffJM6mDvv27nPzxY8UdozxWbkQpjHS2',
      value: 557,
    })
    psbt.addOutput({
      address: 'n2AgWQWzkQoKFbw8p8RkM5uEV2ZdKwDUTi',
      value: 558,
    })
    balance -= 556 + 557 + 558
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

  static async PrepareLegacyTXMainnet(
    key: string,
    txID?: string,
    address?: string,
  ) {
    const keyPair = ECPair.fromWIF(key)
    const psbt = new bitcoin.Psbt()
    let amount = 0
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
          return response.data.txrefs
        })

      const { txs, utxoAmount, value } = await this.betterUtxoMainnet(utxos, 4)
      amount = value
      utxo = txs
      butxoAmount = utxoAmount || 0
    }

    for (let i = 0; i < utxo.length; i++) {
      const hex = await this.getTxMainnet(utxo[i].tx_hash)

      psbt.addInput({
        hash: utxo[i].tx_hash || '',
        index: i,
        nonWitnessUtxo: new Buffer(hex, 'hex'),
      })
    }
    psbt.addOutput({
      address: '2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2',
      value: amount || 0 - butxoAmount || 0,
    })
    psbt.addOutput({
      address: 'n2gFaiBfqAqnfDExzXRh6sFtGzYjHxQP9K',
      value: 10,
    })
    psbt.signInput(0, keyPair)
    psbt.finalizeAllInputs()
    return psbt.extractTransaction().toHex()
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
  static async SendToMainnet(tx: string) {
    await axios
      .post(
        'api.blockcypher.com/v1/btc/main/main/txs/push?token=f3940bcec5bb4f1b9edfca8f6cabce65',
        { tx: tx },
      )
      .then(function (response) {
        return response
      })
      .catch(function (response) {
        return response
      })
  }

  static async calculateFeeMainnet(outs: number, ins: number) {
    const size = ins * 180 + outs * 34 + 10 - ins

    const fee = await axios
      .get('api.blockcypher.com/v1/btc/main')
      .then(response => {
        return response.data.medium_fee_per_kb
      })
      .catch(err => {
        return err
      })
    return size * fee
  }
  static async calculateFeeTestnet(outs: number, ins: number) {
    const size = ins * 148 + outs * 34 + 10 - ins
    // const size = ins * 180 + outs * 34 + 10 - ins
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

  private static async betterUtxoMainnet(txs: UTXO[], outs: number) {
    const largeTxs: UTXO[] = []
    const smaller: UTXO[] = []
    let value = await this.calculateFeeMainnet(outs, 1)
    for (const tx of txs) {
      if (tx.value > value) {
        largeTxs.push(tx)
      } else {
        smaller.push(tx)
      }
    }
    smaller.sort(this.reverseSort)
    largeTxs.sort(this.sort)
    if (smaller.length > 1) {
      let bufferValue = 0
      const utxos: UTXO[] = []
      for (let i = 0; i < smaller.length; i++) {
        value = await this.calculateFeeMainnet(outs, i)
        if (bufferValue < value) {
          bufferValue += smaller[i].value
          utxos.push(smaller[i])
        }
        return {
          txs: utxos,
          utxoAmount: bufferValue,
          value: value,
        }
      }
    }
    const utxoRes: UTXO[] = []
    utxoRes.push(largeTxs[0])
    //todo make better
    return {
      txs: utxoRes,
      utxoAmoutn: largeTxs[0].value,
      value: value,
    }
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
  private static async getTxMainnet(hash: string) {
    const tx = await axios
      .get(
        'https://api.blockcypher.com/v1/btc/main/txs/' +
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
    smaller.sort(this.reverseSort)
    largeTxs.sort(this.sort)
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

  private static sort = (a: UTXO, b: UTXO) => {
    return a.value - b.value
  }

  private static reverseSort = (a: UTXO, b: UTXO) => {
    return b.value - a.value
  }
}

export default {
  Bitcoin,
}
