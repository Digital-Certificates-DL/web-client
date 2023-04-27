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
import {
  AddressInfo,
  PustTxResponce,
  TxList,
  UTXO,
} from '@/types/bitcoin.types'
import { api } from '@/api'

//todo  find utxos in first 100 keys

export class Bitcoin {
  static addressInfoList: AddressInfo[] = []
  static getUTXOTestnet = async (mnph: string) => {
    const seed = await mnemonicToSeedAsync(mnph).then(bytes => {
      return bytes
    })
    let emptyAddreeses = 0
    let index = 0

    while (emptyAddreeses < 30) {
      const bip = bip32.fromSeed(seed, testnet)
      const key = bip.derive(index)
      const keyPair = ECPair.fromWIF(key.toWIF(), testnet)

      const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: testnet,
      })

      const utxos = await api
        .get<TxList>(
          'https://api.blockcypher.com/v1/btc/test3/addrs/' + address,
        )
        .then(function (response) {
          let txs: UTXO[] = []
          if (response.data.txrefs) {
            txs = response.data.txrefs
          }

          if (response.data.unconfirmed_txrefs) {
            txs = txs.concat(response.data.unconfirmed_txrefs)
          }

          return txs
        })
      if (utxos.length !== 0) {
        const result = utxos.filter(data => !data.spent)
        if (result.length === 0) {
          emptyAddreeses++
          index++
          continue
        }
        const addressInfo: AddressInfo = {
          id: index,
          address: address || '',
          utxos: result,
        }
        this.addressInfoList.push(addressInfo)
        index++
        emptyAddreeses = 0
      }
    }
  }
  ///////////////////////
  static PrepareLegacyTXTestnet = async (mnph: string) => {
    const seed = await mnemonicToSeedAsync(mnph).then(bytes => {
      return bytes
    })

    const bip = bip32.fromSeed(seed, testnet)
    const key = bip.derivePath()
    const keyPair = ECPair.fromWIF(key.toWIF(), testnet)

    const exchangeKey = bip.derivePath() //+1
    const keyPairex = ECPair.fromWIF(exchangeKey.toWIF(), testnet)
    const ex = bitcoin.payments.p2pkh({
      pubkey: keyPairex.publicKey,
      network: testnet,
    })

    const psbt = new bitcoin.Psbt({ network: testnet })
    let fee = 0
    let butxoAmount = 0
    let utxo: UTXO[] = []

    const { id, address, txs, utxoAmount, value } =
      await this.betterUtxoTestnet(3, 556 + 557 + 558)
    fee = value
    utxo = txs
    butxoAmount = utxoAmount || 0

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

  private static async betterUtxoTestnet(outs: number, txsValue: number) {
    for (const addressInfo of this.addressInfoList) {
      const largeTxs: UTXO[] = []
      const smaller: UTXO[] = []
      let value = await this.calculateFeeTestnet(outs, 1)
      value += txsValue
      for (const tx of addressInfo.utxos) {
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
            this.addressInfoList = this.addressInfoList.filter(
              data => data.id !== addressInfo.id,
            )
            return {
              id: addressInfo.id,
              address: addressInfo.address,
              txs: utxos,
              utxoAmount: bufferValue,
              value: value,
            }
          }
        }
      }
      if (largeTxs.length !== 0) {
        const utxoRes: UTXO[] = []
        utxoRes.push(largeTxs[0])
        this.addressInfoList = this.addressInfoList.filter(
          data => data.id !== addressInfo.id,
        )
        return {
          id: addressInfo.id,
          address: addressInfo.address,
          txs: utxoRes,
          utxoAmount: largeTxs[0].value,
          value: value,
        }
      }
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
