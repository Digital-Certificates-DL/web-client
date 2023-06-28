import {
  TxOut,
  Address,
  KeyPair,
  PubKey,
  Bn,
  Bip32,
  Bip39,
} from '@ts-bitcoin/core'

// import { BIP32Factory, BIP32Interface } from 'bip32'
// import * as ecc from 'tiny-secp256k1'
// const bip32 = BIP32Factory(ecc)
import { mnemonicToSeedAsync } from 'bip39-web'

import axios from 'axios'
import {
  AddressInfo,
  PustTxResponce,
  UTXO,
  BlockstreamTxList,
  UTXOs,
} from '@/types'
import { Hash, TxBuilder } from '@ts-bitcoin/core'
import { bech32 } from 'bech32'

type NETWORK = 'testnet' | 'mainnet'
type TX_TYPE = 'legacy' | 'segwit'

export class Bitcoin {
  public addressInfoList: AddressInfo[] = []

  private segWitAddress = (publicKey: Buffer) => {
    const bech32Words = bech32.toWords(Hash.sha256Ripemd160(publicKey))
    const words = new Uint8Array([0, ...bech32Words])
    const address = bech32.encode('bc', words)
    // eslint-disable-next-line no-console
    console.log('address seg wit: ', address)

    return address
  }

  private legacyAddress = (publicKey: Buffer) => {
    return Address.Testnet.fromPubKey(PubKey.fromBuffer(publicKey))
  }

  private bip32Derive = (bip: Bip32, path: string) => {
    const key = bip.derive(path)
    return KeyPair.Testnet.fromPrivKey(key.privKey)
  }

  private generateAddress = (keyPair: KeyPair) => {
    //todo implement switch  case
    return this.legacyAddress(keyPair.pubKey.toBuffer())
  }

  public getUTXOBip32Blockstream = async (
    mnph: string,
    network?: NETWORK,
    txType?: TX_TYPE,
  ) => {
    let api = ''
    if (!network) {
      network = 'mainnet'
    }

    if (!txType) txType = 'legacy'

    switch (network) {
      case 'mainnet':
        api = 'https://blockstream.info/api/address/'
        break
      case 'testnet':
        api = 'https://blockstream.info/testnet/api/address/'
        break
    }
    // eslint-disable-next-line no-console
    console.log(Buffer.from('2324'))
    // eslint-disable-next-line no-console
    console.log('start get utxo')
    const seed = Bip39.fromString(mnph).toSeed()
    // eslint-disable-next-line no-console
    console.log('mnemonicToSeedAsync: ', seed)
    let emptyAddreeses = 0
    let index = 0
    const bip = Bip32.Testnet.fromSeed(seed)
    // eslint-disable-next-line no-console
    console.log('bip: ', bip)

    while (emptyAddreeses < 10) {
      for (let keyType = 0; keyType < 2; keyType++) {
        const path = 'm/' + keyType + '/' + index
        const keyPair = this.bip32Derive(bip, path)

        const address = this.generateAddress(keyPair)
        /* eslint-disable no-console */

        console.log(address.toString())
        if (!address) {
          continue
        }

        const txs = await axios.get<BlockstreamTxList>(api + address + '/txs')
        /* eslint-disable no-console */

        console.log('tx: ', txs)
        console.log('emptyAddreeses: ', emptyAddreeses)

        if (txs.data.length === 0) {
          emptyAddreeses++
          continue
        }

        const utxos = await axios.get<UTXOs>(api + address + '/utxo')
        if (!utxos.data) {
          continue
        }

        const addressInfo: AddressInfo = {
          address: address.toString(),
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

  //////////
  public PrepareLegacyTX = async (mnph: string) => {
    // Generate the BIP32 root key from the mnemonic
    const seed = await mnemonicToSeedAsync(mnph)
    const psbt = new TxBuilder()
    psbt.setFeePerKbNum(await this.getFeeTestnet())

    let fee = 0
    let utxoAmount = 0
    let utxos: UTXO[] = []
    /* eslint-disable no-console */

    console.log('seed', seed)

    const betterUTXO = await this.betterUtxoTestnet(3, 556 + 557 + 558)
    /* eslint-disable no-console */

    console.log(betterUTXO)
    if (!betterUTXO) {
      return
    }

    fee = betterUTXO.value
    utxos = betterUTXO.txs
    utxoAmount = betterUTXO.utxoAmount
    /* eslint-disable no-console */

    console.log(betterUTXO)

    if (utxos.length) {
      for (let i = 0; i < utxos.length; i++) {
        if (utxos[i].vout === -1) {
          this.addressInfoList = this.addressInfoList.filter(data =>
            data.utxos.filter(data => data.vout !== -1),
          ) /* eslint-disable no-console */

          console.log('return')
          return
        }
        /* eslint-disable no-console */

        console.log('start set input')
        const txhash = Buffer.from(utxos[i].txid)
        /* eslint-disable no-console */

        console.log('hash : ', txhash)
        const value = new Bn(utxos[i].value)
        /* eslint-disable no-console */

        console.log('value  : ', value)
        const address = betterUTXO.addressInfo.address
        Address.Testnet.fromString(betterUTXO.addressInfo.address)
        /* eslint-disable no-console */
        console.log('address  : ', address)

        const script = Address.Testnet.fromString(address).toTxOutScript()
        /* eslint-disable no-console */

        console.log('script : ', script)

        psbt.inputFromPubKeyHash(
          txhash,
          utxos[i].vout,
          TxOut.fromProperties(
            new Bn(utxos[i].value),
            Address.Testnet.fromString(
              betterUTXO.addressInfo.address,
            ).toTxOutScript(),
          ),
        )
      }
    }

    console.log('set input')

    const bip = Bip32.Testnet.fromSeed(seed)
    const keyPair = this.bip32Derive(bip, betterUTXO.addressInfo.path)
    const exPath = this.prepareExPath(betterUTXO.addressInfo.path)

    const keyPairEx = this.bip32Derive(bip, exPath)

    const ex = this.generateAddress(keyPairEx)

    let balance = utxoAmount
    console.log('balance: ', balance)

    console.log(
      'address',
      Address.Testnet.isValid('n4E3a5gBftxojd1Kk6PLWm7bLgLnvZZtAW'),
    )

    psbt
      .outputToAddress(
        new Bn(556),
        Address.Testnet.fromString('n4E3a5gBftxojd1Kk6PLWm7bLgLnvZZtAW'),
      )
      .outputToAddress(
        new Bn(557),
        Address.Testnet.fromString('n2AgWQWzkQoKFbw8p8RkM5uEV2ZdKwDUTi'),
      )
      .outputToAddress(
        new Bn(558),
        Address.Testnet.fromString('n1NffJM6mDvv27nPzxY8UdozxWbkQpjHS2'),
      )

    balance -= 556 + 557 + 558
    balance -= fee
    console.log('psbt.feeAmountBn: ', psbt.feeAmountBn)
    console.log('fee: ', fee)
    psbt.setChangeAddress(ex)
    console.log(ex.toString())

    console.log('set ex')
    psbt.signWithKeyPairs([keyPair, keyPair, keyPair])
    // console.log('sig')

    psbt.build()
    console.log('build', psbt)
    /* eslint-disable no-console */

    console.log(psbt.toJSON().tx)
    const hex = await psbt.asyncToHex()
    /* eslint-disable no-console */

    console.log(hex)
    this.addressInfoList = this.addressInfoList.filter(
      data => data.utxos.length !== 0,
    )

    return {
      hex,
      ex,
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
    return size * Number(await this.getFeeTestnet())
  }

  public async getFeeTestnet() {
    // const fee: Map<string, number> = await (
    //   await axios.get
    // )<Map<string, number>>('https://blockstream.info/testnet/api/fee-estimates')
    //   .then(response => {
    //     return response.data
    //   })
    //   .catch(err => {
    //     return ErrorHandler.process(err)
    //   })
    //
    // return Number(fee.get('1'))

    return 1
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
      /* eslint-disable no-console */

      console.log('addressInfo.utxos: ', addressInfo.utxos)

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
            /* eslint-disable no-console */

            console.log('return smaller: ')
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

  // static getAddressFromWIF(wif: string, network?: Network) {
  //   const keyPairex = ECPair.fromWIF(wif, network)
  //   const key = bitcoin.payments.p2pkh({
  //     pubkey: keyPairex.publicKey,
  //     network: network,
  //   })
  //
  //   return key.address
  // }

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
