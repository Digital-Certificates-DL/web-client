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
  GetTxHex,
} from '@/types'
import { BN } from '@distributedlab/tools'
import { api } from '@/api'
import { ErrorHandler } from '@/helpers'
import { FailedToSetInput } from '@/errors/runtime.errors'
import { useI18n } from 'vue-i18n'

export class Bitcoin {
  public addressInfoList: AddressInfo[] = []
  public emptyAddressesNumber = 0

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

  public prepareLegacyTxTestnet = async (mnemonikPhrase: string) => {
    const seed = await mnemonicToSeedAsync(mnemonikPhrase)
    const { t } = useI18n()

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
      try {
        psbt = await this.setInputs(psbt, betterUTXO.utxs)
      } catch (errro) {
        ErrorHandler.process(t('errors.failed-set-bitcoin-input'))
      }
    }
    const bipInfo = this.getBipInfoByPath(seed, betterUTXO.addressInfo.path)
    const exBipInfo = this.getBipInfoByPath(seed, bipInfo.exPath)
    const psbtOuts = this.setOutputs(
      psbt,
      BN.fromRaw(betterUTXO.utxoAmount),
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

  public initUTXOBip32TestnetBlockstream = async (
    mnemonikPhrase: string,
    expectedEnptyAddressesCount?: number,
  ) => {
    const seed = Bip39.fromString(mnemonikPhrase).toSeed()
    let index = 0

    while (
      this.emptyAddressesNumber <
      (expectedEnptyAddressesCount || this.EMPTY_ADDRESSES)
    ) {
      for (let i = 0; i < 2; i++) {
        await this.setUTXOBip32TestnetBlockstream(i, index, seed)
      }
      index++
    }
    return this.addressInfoList
  }

  public setUTXOBip32TestnetBlockstream = async (
    addressType: number,
    index: number,
    seed: Buffer,
  ) => {
    const path = 'm/' + addressType + '/' + index
    const bipInfo = this.getBipInfoByPath(seed, path)
    if (!bipInfo.address) {
      return
    }

    const txs = await api.fetcher
      .withBaseUrl('https://blockstream.info')
      .get<BlockstreamTxList>(
        '/testnet/api/address/' + bipInfo.address + '/txs',
      )
    if (!txs.data || !txs.data.length) {
      this.emptyAddressesNumber++
      return
    }

    const utxos = await api.fetcher
      .withBaseUrl('https://blockstream.info')
      .get<UTXO[]>('/testnet/api/address/' + bipInfo.address + '/utxo')
    if (!utxos.data || !utxos.data.length) {
      return
    }
    this.emptyAddressesNumber = 0
    const addressInfo: AddressInfo = {
      address: bipInfo.address,
      path: path,
      utxos: utxos.data,
    }
    this.addressInfoList.push(addressInfo)
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
    balance.sub(
      BN.fromRaw(this.TX_OUTPUTS_INFO.firstOutput)
        .add(BN.fromRaw(this.TX_OUTPUTS_INFO.secondOutput))
        .add(BN.fromRaw(this.TX_OUTPUTS_INFO.thirdOutput)),
    )

    balance.sub(BN.fromRaw(fee))

    psbt.addOutput({
      address: exAddress,
      value: balance.decimals,
    })
    return { psbt: psbt, balance: balance.decimals }
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
        throw FailedToSetInput
      }
      const txData = await this.getTxTestnet(utxoList[i].txid)
      if (!txData) {
        throw FailedToSetInput
      }
      const txHex = new Buffer(txData.hex, 'hex')
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

    const pricePerByte = 5

    return size * pricePerByte
  }

  private async getTxTestnet(hash: string) {
    try {
      const { data } = await fetcher.get<GetTxHex>(
        `https://api.blockcypher.com/v1/btc/test3/txs/${hash}`,
        {
          query: {
            includeHex: true,
          },
        },
      )

      return data
    } catch (error) {
      ErrorHandler.process(error)
    }
  }

  private async findBetterUtxoTestnet(
    addressInfoList: AddressInfo[],
    outs: number,
    txsValue: number,
  ) {
    for (const addressInfo of addressInfoList) {
      const utxosLargeThanTx: UTXO[] = []
      const utxosLessThanTx: UTXO[] = []
      let value = await this.calculateFeeTestnet(outs, 1)
      value += txsValue
      for (const tx of addressInfo.utxos) {
        if (tx.value > value) {
          utxosLargeThanTx.push(tx)
        } else {
          utxosLessThanTx.push(tx)
        }
      }
      utxosLessThanTx.reverse()
      utxosLargeThanTx.sort()
      if (utxosLessThanTx.length > 1) {
        let bufferValue = 0
        const utxos: UTXO[] = []
        for (let i = 0; i < utxosLessThanTx.length; i++) {
          value = await this.calculateFeeTestnet(outs, i)
          value += txsValue
          if (bufferValue < value) {
            bufferValue += utxosLessThanTx[i].value
            utxos.push(utxosLessThanTx[i])
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
      if (utxosLargeThanTx.length) {
        const utxoRes: UTXO[] = []
        utxoRes.push(utxosLargeThanTx[0])
        this.addressInfoList = this.addressInfoList.filter(
          data => data.utxos.length,
        )
        addressInfo.utxos = addressInfo.utxos.filter(
          data => !utxoRes.includes(data),
        )
        return {
          addressInfo: addressInfo,
          utxs: utxoRes,
          utxoAmount: utxosLargeThanTx[0].value,
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
