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
  TxsListNewAPI,
  OutNewAPI,
  PustTxResponce,
  TxList,
  TxNewAPI,
  UTXO,
  AddressInfoNewAPI,
} from '@/types/bitcoin.types'
import { api } from '@/api'
import { address } from 'bitcoinjs-lib'
import path from 'path'
import log from 'loglevel'

//todo  find utxos in first 100 keys

export class Bitcoin {
  public addressInfoList: AddressInfo[] = []
  public getUTXOBip32Testnet = async (mnph: string) => {
    const seed = await mnemonicToSeedAsync(mnph)
    let emptyAddreeses = 0
    let index = 0
    const bip = bip32.fromSeed(seed, testnet)
    while (emptyAddreeses < 10) {
      for (let i = 0; i < 2; i++) {
        const path = 'm/' + i + '/' + index
        const key = bip.derivePath(path)
        const keyPair = ECPair.fromWIF(key.toWIF(), testnet)

        const { address } = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
          network: testnet,
        })
        console.log(address)
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
          const result = utxos.filter(
            data => !data.spent && data.tx_output_n !== -1,
          )
          if (result.length === 0) {
            emptyAddreeses++
            continue
          }
          console.log('result: ', result)
          const addressInfo: AddressInfo = {
            path: path,
            address: address || '',
            utxos: result,
          }
          this.addressInfoList.push(addressInfo)
          emptyAddreeses = 0
        }
        console.log('path', path)
      }
      emptyAddreeses++
      index++
      console.log('index', index)
      console.log('emptyAddreeses', emptyAddreeses)

      console.log('addresses info list', this.addressInfoList)
    }
    console.log(this.addressInfoList)
    return this.addressInfoList
  }

  public getUTXOBip32Main = async (mnph: string) => {
    const seed = await mnemonicToSeedAsync(mnph)
    let emptyAddreeses = 0
    let index = 0
    const bip = bip32.fromSeed(seed)
    while (emptyAddreeses < 30) {
      for (let i = 0; i < 2; i++) {
        const path = 'm/' + i + '/' + index
        const key = bip.derivePath(path)
        const keyPair = ECPair.fromWIF(key.toWIF())

        const { address } = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
        })
        const utxos = await api
          .get<TxList>(
            'https://api.blockcypher.com/v1/btc/main/addrs/' + address,
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
            continue
          }
          const addressInfo: AddressInfo = {
            path: path,
            address: address || '',
            utxos: result,
          }
          this.addressInfoList.push(addressInfo)
          emptyAddreeses = 0
        }
      }
      index++
      console.log('index', index)
      console.log('addresses info list', this.addressInfoList)
    }
    console.log(this.addressInfoList)

    return this.addressInfoList
  }

  public getUTXOBip32MainNewAPI = async (mnph: string) => {
    const addressInfoList = []
    const seed = await mnemonicToSeedAsync(mnph)
    console.log('seed', seed)

    let emptyAddreeses = 0
    let index = 0
    const bip = bip32.fromSeed(seed)
    while (emptyAddreeses < 10) {
      for (let i = 0; i < 2; i++) {
        const path = 'm/' + i + '/' + index
        const key = bip.derivePath(path)
        const keyPair = ECPair.fromWIF(key.toWIF())

        const { address } = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
        })
        const utxos = await api
          .get<TxsListNewAPI>(
            'https://blockchain.info/address/' + address + '?format=json',
          )
          .then(function (response) {
            let txs: TxNewAPI[] = []
            if (response.data.txs) {
              txs = response.data.txs
            }

            return txs
          })
        console.log('path', path)

        if (utxos.length !== 0) {
          const result = utxos.filter(data => data.out)
          const outs = result.filter(data =>
            data.out.filter(data => !data.spent && data.addr === address),
          )
          if (outs.length === 0) {
            emptyAddreeses++
            continue
          }
          const addressInfo: AddressInfoNewAPI = {
            path: path,
            address: address || '',
            utxos: result,
          }
          addressInfoList.push(addressInfo)
          emptyAddreeses = 0
        }
      }
      index++
      emptyAddreeses++
      console.log('index', index)
      console.log('emptyAddreeses', emptyAddreeses)

      console.log('addresses info list', this.addressInfoList)
    }
    console.log(addressInfoList)

    return this.addressInfoList
  }

  ///////////////////////
  public PrepareLegacyTXTestnet = async (mnph: string) => {
    const seed = await mnemonicToSeedAsync(mnph).then(bytes => {
      return bytes
    })

    const psbt = new bitcoin.Psbt({ network: testnet })
    let fee = 0
    let butxoAmount = 0
    let utxo: UTXO[] = []
    console.log('after better', this.addressInfoList)
    const betterUTXO = await this.betterUtxoTestnet(3, 556 + 557 + 558)
    if (!betterUTXO) {
      return
    }
    console.log('before better: ', betterUTXO)

    fee = betterUTXO.value
    utxo = betterUTXO.txs
    butxoAmount = betterUTXO.utxoAmount
    if (utxo.length) {
      for (let i = 0; i < utxo.length; i++) {
        console.log(utxo[i])
        if (utxo[i].tx_output_n === -1) {
          this.addressInfoList = this.addressInfoList.filter(data =>
            data.utxos.filter(data => data.tx_output_n !== -1),
          )
          console.log('skip')
          return
        }
        const hex = await this.getTxTestnet(utxo[i].tx_hash)
        const txHex = new Buffer(hex, 'hex')
        console.log(utxo)

        psbt.addInput({
          hash: utxo[i].tx_hash,
          index: utxo[i].tx_output_n,
          nonWitnessUtxo: txHex,
        })
      }
    }

    const bip = bip32.fromSeed(seed, testnet)
    const key = bip.derivePath(betterUTXO.addressInfo.path)
    const keyPair = ECPair.fromWIF(key.toWIF(), testnet)
    const exPath = this.prepareExPath(betterUTXO.addressInfo.path)
    const exchangeKey = bip.derivePath(exPath)
    const keyPairex = ECPair.fromWIF(exchangeKey.toWIF(), testnet)
    const ex = bitcoin.payments.p2pkh({
      pubkey: keyPairex.publicKey,
      network: testnet,
    })

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

    this.addressInfoList = this.addressInfoList.filter(
      data => data.utxos.length !== 0,
    )

    return {
      hex,
      exAddress,
      exPath,
      balance,
    }
  }

  public async SendToTestnet(tx: string) {
    // todo add token
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

  public async calculateFeeTestnet(outs: number, ins: number) {
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

  private async getTxTestnet(hash: string) {
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

  private async betterUtxoTestnet(outs: number, txsValue: number) {
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
        const utxos: UTXO[] = []
        for (let i = 0; i < smaller.length; i++) {
          value = await this.calculateFeeTestnet(outs, i)
          value += txsValue
          if (bufferValue < value) {
            bufferValue += smaller[i].value
            utxos.push(smaller[i])
          } else {
            this.addressInfoList = this.addressInfoList.filter(
              data => data.utxos.length !== 0,
            )
            addressInfo.utxos = addressInfo.utxos.filter(
              data => !utxos.includes(data),
            )
            return {
              addressInfo: addressInfo,
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
          data => data.utxos.length !== 0,
        )
        addressInfo.utxos = addressInfo.utxos.filter(
          data => !utxoRes.includes(data),
        )
        return {
          addressInfo: addressInfo,
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

  private prepareExPath = (path: string) => {
    const addressIndex = path.replace('m/', '')
    if (addressIndex[0] === '0') {
      return 'm/1/' + addressIndex[2]
    }
    const newpath = parseInt(addressIndex[2], 10) + 1
    return 'm/1/' + newpath
  }

  public setNewUTXO = (
    address: string,
    path: string,
    hex: string,
    value: number,
  ) => {
    const newUTXO = {
      tx_hash: hex,
      value: value,
    } as UTXO

    const index = this.addressInfoList.findIndex(
      data => data.address === address,
    )
    if (index < 0) {
      const UTXOs: UTXO[] = []
      UTXOs.push(newUTXO)

      const newAddressInfo = {
        path: path,
        address: address,
        utxos: UTXOs,
      } as AddressInfo
      this.addressInfoList.push(newAddressInfo)
      return
    }
    this.addressInfoList[index].utxos.push(newUTXO)
  }

  private sort = (a: UTXO, b: UTXO) => {
    return a.value - b.value
  }

  private reverseSort = (a: UTXO, b: UTXO) => {
    return b.value - a.value
  }
}

export default {
  Bitcoin,
}
