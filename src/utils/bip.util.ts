import { mnemonicToSeedAsync } from 'bip39-web'
import { testnet } from 'ecpair/src/networks'
import * as bitcoin from 'bitcoinjs-lib'

import * as ecc from 'tiny-secp256k1'

import ECPairFactory from 'ecpair'
import BIP32Factory from 'bip32'
const bip32 = BIP32Factory(ecc)

const ECPair = ECPairFactory(ecc)

export class Bip {
  static genAddress = async (mnph: string, index: number) => {
    const seed = await mnemonicToSeedAsync(mnph).then(bytes => {
      return bytes
    })
    const bip = bip32.fromSeed(seed, testnet)
    const keyPair = ECPair.fromWIF(bip.toWIF(), testnet)
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: testnet,
    })
    return { address, index }
  }
}

export default Bip
