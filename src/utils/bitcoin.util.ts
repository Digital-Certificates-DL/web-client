import { testnet } from 'ecpair/src/networks'
import bitcoin from 'bitcoinjs-lib'
// import * as ecc from 'tiny-secp256k1-browserify'
import { Bip32, Bip39 } from '@ts-bitcoin/core'
import { mnemonicToSeedAsync } from 'bip39-web'

// const ECPair = ECPairFactory(ecc)
// import { ECPairFactory } from 'ecpair'

import axios from 'axios'
import {
  AddressInfo,
  PustTxResponce,
  UTXO,
  BlockstreamTxList,
  UTXOs,
} from '@/types/bitcoin.types'
// const ECPair = ECPairFactory(ecc)

export class Bitcoin {
  public addressInfoList: AddressInfo[] = []

  private bip32Derive = (bip: Bip32, path: string) => {
    /* eslint-disable no-console */
    console.log('path: ', path)
    const key = bip.derive(path)
    /* eslint-disable no-console */
    console.log('key: ', key)
    /* eslint-disable no-console */
    console.log('key: ', key.privKey.toWif())
    /* eslint-disable no-console */
    console.log('key: ', key.privKey.toBuffer())
    return bitcoin.ECPair.fromWIF(key.privKey.toWif())
  }

  public getUTXOBip32MainBlockstream = async (mnph: string) => {
    const seed = await mnemonicToSeedAsync(mnph)
    let emptyAddreeses = 0
    let index = 0
    const bip = Bip32.fromSeed(seed)
    while (emptyAddreeses < 10) {
      for (let i = 0; i < 2; i++) {
        const path = 'm/' + i + '/' + index
        const keyPair = this.bip32Derive(bip, path)

        const { address } = bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
        })

        /* eslint-disable no-console */
        console.log('address: ', address)
        if (address === undefined) {
          continue
        }

        const txs = await axios.get<BlockstreamTxList>(
          'https://blockstream.info/api/address/' + address + '/txs',
        )
        if (txs.data.length === 0) {
          emptyAddreeses++
          continue
        }

        const utxos = await axios.get<UTXOs>(
          'https://blockstream.info/api/address/' + address + '/utxo',
        )
        if (utxos.data.length === 0) {
          continue
        }

        const addressInfo: AddressInfo = {
          address: address,
          path: path,
          utxos: utxos.data,
        }
        this.addressInfoList.push(addressInfo)
      }
      index++
      emptyAddreeses++
    }
    return this.addressInfoList
  }

  public getUTXOBip32TestnetBlockstream = async (mnph: string) => {
    const seed = Bip39.fromString(mnph).toSeed()
    let emptyAddreeses = 0
    let index = 0

    /* eslint-disable no-console */
    console.log('seed: ', seed)

    const bip = Bip32.fromSeed(seed)
    console.log('bip: ', bip)

    while (emptyAddreeses < 10) {
      for (let i = 0; i < 2; i++) {
        const path = 'm/' + i + '/' + index
        const keyPair = this.bip32Derive(bip, path)

        const { address } = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
          network: testnet,
        })

        if (address === undefined) {
          continue
        }
        const txs = await axios.get<BlockstreamTxList>(
          'https://blockstream.info/testnet/api/address/' + address + '/txs',
        )
        if (txs.data.length === 0) {
          emptyAddreeses++
          continue
        }

        const utxos = await axios.get<UTXOs>(
          'https://blockstream.info/testnet/api/address/' + address + '/utxo',
        )
        if (utxos.data.length === 0) {
          continue
        }
        emptyAddreeses = 0
        const addressInfo: AddressInfo = {
          address: address,
          path: path,
          utxos: utxos.data,
        }
        this.addressInfoList.push(addressInfo)
      }
      index++
    }
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

    const betterUTXO = await this.betterUtxoTestnet(3, 556 + 557 + 558)
    if (!betterUTXO) {
      return
    }
    fee = betterUTXO.value
    utxo = betterUTXO.txs
    butxoAmount = betterUTXO.utxoAmount
    if (utxo.length) {
      for (let i = 0; i < utxo.length; i++) {
        if (utxo[i].vout === -1) {
          this.addressInfoList = this.addressInfoList.filter(data =>
            data.utxos.filter(data => data.vout !== -1),
          )
          return
        }
        const hex = await this.getTxTestnet(utxo[i].txid)
        const txHex = new Buffer(hex, 'hex')
        psbt.addInput({
          hash: utxo[i].txid,
          index: utxo[i].vout,
          nonWitnessUtxo: txHex,
        })
      }
    }

    const bip = Bip32.Testnet.fromSeed(seed)

    const keyPair = this.bip32Derive(bip, betterUTXO.addressInfo.path)

    const exPath = this.prepareExPath(betterUTXO.addressInfo.path)

    const keyPairex = this.bip32Derive(bip, exPath)
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
    // const fee = 10
    // fee = await axios
    //   .get('https://bitcoinfees.earn.com/api/v1/fees/recommended')
    //   .then(response => {
    //     return response.data.hourFee
    //   })
    //   .catch(err => {
    //     return err
    //   })

    return size * Number(2)
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

  static getAddressFromWIF(wif: string, network?: bitcoin.Network) {
    /* eslint-disable no-console */
    console.log('getAddressFromWIF')

    /* eslint-disable no-console */
    console.log('wif: ', wif)

    /* eslint-disable no-console */
    console.log('bitcoin.ECPair.fromWIF: ', bitcoin.ECPair.fromWIF)

    const keyPairex = bitcoin.ECPair.fromWIF(wif)
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
    vout?: number,
  ) => {
    const newUTXO = {
      txid: hex,
      value: value,
      vout: vout || 3,
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
