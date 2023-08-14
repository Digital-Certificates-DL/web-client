import { testnet } from 'ecpair/src/networks'
import bitcoin from 'bitcoinjs-lib'
import { Bip32, Bip39 } from '@ts-bitcoin/core'

import { mnemonicToSeedAsync } from 'bip39-web'

import axios from 'axios'
import {
  AddressInfo,
  PustTxResponce,
  UTXO,
  BlockstreamTxList,
  UTXOs,
} from '@/types/bitcoin.types'

export class Bitcoin {
  public addressInfoList: AddressInfo[] = []

  public readonly TX_FEE_COEFS = {
    numberOfInputs: 148,
    numberOfOutputs: 34,
    overhead: 10,
  }

  public readonly TX_OUTPUTS_INFO = {
    numberOfOutputs: 4,
    firstOutput: 555,
    secondOutput: 556,
    thirdOutput: 557,
    bufferValue: 2000,
  }

  private bip32Derive = (bip: Bip32, path: string) => {
    return bitcoin.ECPair.fromWIF(bip.derive(path).privKey.toWif())
  }

  public getUTXOBip32TestnetBlockstream = async (
    mnph: string,
    emptyAddressCount: number,
  ) => {
    const seed = Bip39.fromString(mnph).toSeed()
    let emptyAddreeses = 0
    let index = 0

    while (emptyAddreeses < emptyAddressCount) {
      for (let i = 0; i < 2; i++) {
        const path = 'm/' + i + '/' + index
        const bipInfo = this.getBipInfoByPath(seed, path)

        if (!bipInfo.address) {
          continue
        }
        const txs = await axios.get<BlockstreamTxList>(
          'https://blockstream.info/testnet/api/address/' +
            bipInfo.address +
            '/txs',
        )
        if (txs.data.length === 0) {
          emptyAddreeses++
          continue
        }

        const utxos = await axios.get<UTXOs>(
          'https://blockstream.info/testnet/api/address/' +
            bipInfo.address +
            '/utxo',
        )
        if (utxos.data.length === 0) {
          continue
        }
        emptyAddreeses = 0
        const addressInfo: AddressInfo = {
          address: bipInfo.address,
          path: path,
          utxos: utxos.data,
        }
        this.addressInfoList.push(addressInfo)
      }
      index++
    }
    return this.addressInfoList
  }

  public PrepareLegacyTXTestnet = async (mnph: string) => {
    const seed = await mnemonicToSeedAsync(mnph).then(bytes => {
      return bytes
    })

    let psbt = new bitcoin.Psbt({ network: testnet })

    let butxoAmount = 0
    let utxo: UTXO[] = []

    const betterUTXO = await this.betterUtxoTestnet(
      this.addressInfoList,
      this.TX_OUTPUTS_INFO.numberOfOutputs,
      this.TX_OUTPUTS_INFO.firstOutput +
        this.TX_OUTPUTS_INFO.secondOutput +
        this.TX_OUTPUTS_INFO.thirdOutput +
        this.TX_OUTPUTS_INFO.bufferValue,
    )
    if (!betterUTXO) {
      return
    }

    utxo = betterUTXO.txs
    butxoAmount = betterUTXO.utxoAmount
    if (utxo.length) {
      psbt = await this.setInputs(psbt, utxo)
    }
    const bipInfo = this.getBipInfoByPath(seed, betterUTXO.addressInfo.path)

    const exBipInfo = this.getBipInfoByPath(seed, bipInfo.exPath)

    const balance = butxoAmount

    psbt = this.setOutputs(
      psbt,
      butxoAmount,
      betterUTXO.value,
      exBipInfo.address!,
    )

    psbt.signInput(0, bipInfo.keyPair)
    psbt.finalizeAllInputs()

    const hex = psbt.extractTransaction().toHex()
    const exAddress = exBipInfo.keyPair

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

  private setOutputs(
    psbt: bitcoin.Psbt,
    balance: number,
    fee: number,
    exAddress: string,
  ): bitcoin.Psbt {
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

  private async setInputs(
    psbt: bitcoin.Psbt,
    utxoList: UTXO[],
  ): Promise<bitcoin.Psbt> {
    for (let i = 0; i < utxoList.length; i++) {
      if (utxoList[i].vout === -1) {
        this.addressInfoList = this.addressInfoList.filter(data =>
          data.utxos.filter(data => data.vout !== -1),
        )
        throw new Error()
      }
      const hex = await this.getTxTestnet(utxoList[i].txid)
      const txHex = new Buffer(hex, 'hex')
      psbt.addInput({
        hash: utxoList[i].txid,
        index: utxoList[i].vout,
        nonWitnessUtxo: txHex,
      })
    }

    return psbt
  }

  public async SendToTestnet(tx: string) {
    return (await axios.post(
      'https://api.blockcypher.com/v1/btc/test3/txs/push',
      { tx: tx },
    )) as PustTxResponce
  }

  public async calculateFeeTestnet(outs: number, ins: number) {
    const size =
      ins * this.TX_FEE_COEFS.numberOfInputs +
      outs * this.TX_FEE_COEFS.numberOfOutputs +
      this.TX_FEE_COEFS.overhead -
      ins

    return size * Number(1)
  }

  private async getTxTestnet(hash: string) {
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

  private async betterUtxoTestnet(
    addressInfoList: AddressInfo[],
    outs: number,
    txsValue: number,
  ) {
    for (const addressInfo of addressInfoList) {
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
      smaller.reverse()
      largeTxs.sort()
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

  private getBipInfoByPath(
    seed: Buffer,
    path: string,
    network?: bitcoin.Network,
  ) {
    const bip = Bip32.Testnet.fromSeed(seed)
    const keyPair = this.bip32Derive(bip, path)
    const exPath = this.prepareExPath(path)
    const key = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: network,
    })
    return {
      keyPair: keyPair,
      address: key.address,
      exPath: exPath,
    }
  }

  static getAddressFromWIF(wif: string, network?: bitcoin.Network) {
    const keyPair = bitcoin.ECPair.fromWIF(wif, network)
    const key = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
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
      vout: vout || this.TX_OUTPUTS_INFO.numberOfOutputs,
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
}

export default {
  Bitcoin,
}
