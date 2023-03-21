import { Ecdsa, Address, KeyPair, PrivKey } from '@ts-bitcoin/core'

// import { ECPairFactory } from 'ecpair'
// import { magicHash } from '@/utils/types/signature'
import bitcoinMessage from 'bitcoinjs-message'

export class Signature {
  private privKey: string

  constructor(privKey: string) {
    this.privKey = privKey
  }

  public signMsg = (message: string | Buffer) => {
    // const keyPair = ECPair.fromWIF(this.privKey)
    // const signature = bitcoinMessage.sign(
    //   message,
    //   keyPair.privateKey!,
    //   keyPair.compressed,
    // )
    // return signature.toString('base64')

    const privKey2 = PrivKey.Mainnet.fromWif(this.privKey)
    const keyPair2 = KeyPair.Mainnet.fromPrivKey(privKey2)
    const addr2 = Address.Mainnet.fromPubKey(keyPair2.pubKey)
    console.log(privKey2)
    const sign = Ecdsa.sign(bitcoinMessage.magicHash(message), keyPair2)
    const compresdSign = sign.toCompact(2, false)
    return compresdSign.toString('base64')
  }
  public verifySign = (
    message: string | Buffer,
    address: string,
    signature: string | Buffer,
  ) => {
    return bitcoinMessage.verify(message, address, signature)
  }
}
