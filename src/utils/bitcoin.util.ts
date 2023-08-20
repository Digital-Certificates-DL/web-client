import { testnet } from 'ecpair/src/networks'
import bitcoin from 'bitcoinjs-lib'
import { Bip32, Bip39 } from '@ts-bitcoin/core'

import { mnemonicToSeedAsync } from 'bip39-web'
import { fetcher } from '@distributedlab/fetcher'
import {
  AddressInfo,
  PustTxResponce,
  UTXO,
  BlockstreamTxList,
  UTXOs,
  getTxHex,
} from '@/types'
import { BN } from '@distributedlab/tools'
import { api } from '@/api'

export class Bitcoin {
  public addressInfoList: AddressInfo[] = []

  public readonly TX_FEE_COEFS = {
    numberOfInputs: 148,
    numberOfOutputs: 34,
    overhead: 10,
  }

  public readonly EMPTY_ADDRESSES = 5

  public readonly TX_OUTPUTS_INFO = {
    numberOfOutputs: 4,
    firstOutput: 555,
    secondOutput: 556,
    thirdOutput: 557,
    bufferValue: 2000,
  }

  public prepareLegacyTXTestnet = async (mnemonikPhrase: string) => {
    const seed = await mnemonicToSeedAsync(mnemonikPhrase)

    let psbt = new bitcoin.Psbt({ network: testnet })
    const betterUTXO = await this.findBetterUtxoTestnet(
      this.addressInfoList,
      this.TX_OUTPUTS_INFO.numberOfOutputs,
      this.TX_OUTPUTS_INFO.firstOutput +
        this.TX_OUTPUTS_INFO.secondOutput +
        this.TX_OUTPUTS_INFO.thirdOutput +
        this.TX_OUTPUTS_INFO.bufferValue,
    )
    if (!betterUTXO) {
      throw new Error()
    }

    if (betterUTXO.utxs.length) {
      psbt = await this.setInputs(psbt, betterUTXO.utxs)
    }
    const bipInfo = this.getBipInfoByPath(seed, betterUTXO.addressInfo.path)
    const exBipInfo = this.getBipInfoByPath(seed, bipInfo.exPath)
    const psbtOuts = this.setOutputs(
      psbt,
      betterUTXO.utxoAmount,
      betterUTXO.value,
      exBipInfo.address,
    )

    this.addressInfoList = this.addressInfoList.filter(
      data => !data.utxos.length,
    )

    return {
      hex: psbtOuts.psbt
        .signInput(0, bipInfo.keyPair)
        .finalizeAllInputs()
        .extractTransaction()
        .toHex(),
      exAddress: exBipInfo.address,
      exPath: bipInfo.exPath,
      balance: psbtOuts.balance,
    }
  }

  private deriveBIP32ByPath = (bip: Bip32, path: string) => {
    return bitcoin.ECPair.fromWIF(bip.derive(path).privKey.toWif())
  }

  public getUTXOBip32TestnetBlockstream = async (
    mnemonikPhrase: string,
    emptyAddressCount: number,
  ) => {
    const seed = Bip39.fromString(mnemonikPhrase).toSeed()
    let emptyAddreeses = 0
    let index = 0

    while (emptyAddreeses < emptyAddressCount) {
      for (let i = 0; i < 2; i++) {
        const path = 'm/' + i + '/' + index
        const bipInfo = this.getBipInfoByPath(seed, path)
        if (!bipInfo.address) {
          continue
        }

        const txs = await api.fetcher
          .withBaseUrl('https://blockstream.info')
          .get<BlockstreamTxList>(
            '/testnet/api/address/' + bipInfo.address + '/txs',
          )
        if (!txs.data || !txs.data.length) {
          emptyAddreeses++
          continue
        }

        const utxos = await api.fetcher
          .withBaseUrl('https://blockstream.info')
          .get<UTXOs>('/testnet/api/address/' + bipInfo.address + '/utxo')
        if (!utxos.data || !utxos.data.length) {
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

  private setOutputs(
    psbt: bitcoin.Psbt,
    balance: BN,
    fee: number,
    exAddress: string,
  ): { psbt: bitcoin.Psbt; balance: number } {
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
    return { psbt: psbt, balance: balance }
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
        return psbt
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

  public async sendToTestnet(tx: string) {
    return (await fetcher.post(
      'https://api.blockcypher.com/v1/btc/test3/txs/push',
      {
        body: {
          tx: tx,
        },
      },
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
      const { data } = await fetcher.get<getTxHex>(
        `https://api.blockcypher.com/v1/btc/test3/txs/${hash}`,
        {
          query: {
            includeHex: true,
          },
        },
      )

      return data!.hex
    } catch (error) {
      throw new Error()
    }
  }

  private async findBetterUtxoTestnet(
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
              data => data.utxos.length,
            )
            addressInfo.utxos = addressInfo.utxos.filter(
              data => !utxos.includes(data),
            )
            return {
              addressInfo: addressInfo,
              utxs: utxos,
              utxoAmount: bufferValue,
              value: value,
            }
          }
        }
      }
      if (largeTxs.length) {
        const utxoRes: UTXO[] = []
        utxoRes.push(largeTxs[0])
        this.addressInfoList = this.addressInfoList.filter(
          data => data.utxos.length,
        )
        addressInfo.utxos = addressInfo.utxos.filter(
          data => !utxoRes.includes(data),
        )
        return {
          addressInfo: addressInfo,
          utxs: utxoRes,
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
    const keyPair = this.deriveBIP32ByPath(bip, path)
    const exPath = this.prepareExPath(path)
    const key = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: network || testnet,
    })

    if (!key.address) {
      throw new Error()
    }
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
    if (!key.address) {
      throw new Error()
    }

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
