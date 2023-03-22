import { Ecdsa, Address, KeyPair, PrivKey } from '@ts-bitcoin/core'

// import { ECPairFactory } from 'ecpair'
// import { magicHash } from '@/utils/types/signature'
import bitcoinMessage from 'bitcoinjs-message'

export class Signature {
  private keyPair: KeyPair
  private address: Address

  constructor(privKey: string) {
    const key = PrivKey.Mainnet.fromWif(privKey)
    const keyPair = KeyPair.Mainnet.fromPrivKey(key)
    const address = Address.Mainnet.fromPubKey(keyPair.pubKey)
    this.keyPair = keyPair
    this.address = address
  }

  public signMsg = (message: string | Buffer) => {
    const sign = Ecdsa.sign(bitcoinMessage.magicHash(message), this.keyPair)
    // const compSign = sign.toCompact(3, true)

    for (let i = 0; i < 4; i++) {
      const compSign = sign.toCompact(i).toString('base64')
      if (this.verifySign(message, this.address.toString(), compSign)) {
        return compSign
      }
    }
  }
  public verifySign = (
    message: string | Buffer,
    address: string,
    signature: string | Buffer,
  ) => {
    return bitcoinMessage.verify(message, address, signature)
  }
}
