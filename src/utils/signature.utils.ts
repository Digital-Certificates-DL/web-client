import ecc from '@bitcoinerlab/secp256k1'
import { ECPairFactory } from 'ecpair'
import { magicHash } from '@/utils/types/signature'
import bitcoinMessage from 'bitcoinjs-message'

const ECPair = ECPairFactory(ecc)

export class Signature {
  private privKey: string

  constructor(privKey: string) {
    this.privKey = privKey
  }

  public signMsg = (message: string | Buffer) => {
    const keyPair = ECPair.fromWIF(this.privKey)
    const signature = bitcoinMessage.sign(
      message,
      keyPair.privateKey!,
      keyPair.compressed,
    )
    return signature.toString('base64')
  }
  public verifySign = (
    message: string | Buffer,
    address: string,
    signature: string | Buffer,
  ) => {
    return bitcoinMessage.verify(message, address, signature)
  }
  public magicMsgHash = (message: string | Buffer, messagePrefix?: string) => {
    return magicHash(message, messagePrefix)
  }
}
