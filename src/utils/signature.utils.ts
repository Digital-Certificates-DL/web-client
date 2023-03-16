import ecc from '@bitcoinerlab/secp256k1'
import { ECPairFactory } from 'ecpair'
import { magicHash } from '@/utils/types/signature'
import bitcoinMessage from 'bitcoinjs-message'


const ECPair = ECPairFactory(ecc)

export class Signature {
  public signMsg = (message: string | Buffer, privateKeyStr: string) => {
    const keyPair = ECPair.fromWIF(privateKeyStr)
    const privateKey = keyPair.privateKey
    const signature = bitcoinMessage.sign(
      message,
      privateKey,
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
