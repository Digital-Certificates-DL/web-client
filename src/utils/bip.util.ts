import { mnemonicToSeedAsync } from 'bip39-web'
import { testnet } from 'ecpair/src/networks'
import * as bitcoin from 'bitcoinjs-lib'

import * as ecc from 'tiny-secp256k1'

const bip32 = BIP32Factory(ecc)
import ECPairFactory from 'ecpair'
import BIP32Factory from 'bip32'
const ECPair = ECPairFactory(ecc)

export class Bip {
  static genAddress = async (mnph: string, index: number) => {
    const seed = await mnemonicToSeedAsync(mnph).then(bytes => {
      return bytes
    })

    const bip = bip32.fromSeed(seed, testnet)
    index++
    // n4cpKQKAt2YJdf8DBxFzPATJWX42t5h7C4
    const exchangeKey = bip.derive(index)
    console.log('index: ', bip.index)
    console.log('ex: ', exchangeKey)
    const keyPairex = ECPair.fromWIF(exchangeKey.toWIF(), testnet)
    console.log('key: ', keyPairex)
    const ex = bitcoin.payments.p2pkh({
      pubkey: keyPairex.publicKey,
      network: testnet,
    })

    console.log(ex.address)

    const keyPair = ECPair.fromWIF(bip.toWIF(), testnet)

    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: testnet,
    })
  }
}
